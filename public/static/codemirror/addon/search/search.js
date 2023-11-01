// Define search commands. Depends on dialog.js or another
// implementation of the openDialog method.

// Replace works a little oddly -- it will do the replace on the next
// Ctrl-G (or whatever is bound to findNext) press. You prevent a
// replace by making sure the match is no longer selected when hitting
// Ctrl-G.

(function() {
  function searchOverlay(query, caseInsensitive) {
    var startChar;
    if (typeof query == "string") {
      startChar = query.charAt(0);
      query = new RegExp("^" + query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
                         caseInsensitive ? "i" : "");
    } else {
      query = new RegExp("^(?:" + query.source + ")", query.ignoreCase ? "i" : "");
    }
    if (typeof query == "string") return {token: function(stream) {
      if (stream.match(query)) return "searching";
      stream.next();
      stream.skipTo(query.charAt(0)) || stream.skipToEnd();
    }};
    return {token: function(stream) {
      if (stream.match(query)) return "searching";
      while (!stream.eol()) {
        stream.next();
        if (startChar)
          stream.skipTo(startChar) || stream.skipToEnd();
        if (stream.match(query, false)) break;
      }
    }};
  }

  function SearchState() {
    this.posFrom = this.posTo = this.query = null;
    this.overlay = null;
  }
  function getSearchState(cm) {
    return cm.state.search || (cm.state.search = new SearchState());
  }
  function queryCaseInsensitive(query) {
    return typeof query == "string" && query == query.toLowerCase();
  }
  function getSearchCursor(cm, query, pos) {
    // Heuristic: if the query string is all lowercase, do a case insensitive search.
    return cm.getSearchCursor(query, pos, queryCaseInsensitive(query));
  }
  function getSingleLineSel(cm) {
    var start = cm.getCursor("start");
    var end = cm.getCursor("end");
    if (start.line == end.line && start.ch != end.ch) {
      return cm.getSelection();
    }
  }
  function dialog(cm, text, shortText, deflt, f) {
    if (cm.openDialog) return cm.openDialog(text, f, { keepOpen: true, catchCtrlF: true, value: deflt });
    else f(prompt(shortText, deflt));
  }
  function confirmDialog(cm, text, shortText, fs) {
    if (cm.openConfirm) cm.openConfirm(text, fs);
    else if (confirm(shortText)) fs[0]();
  }
  function parseQuery(query) {
    var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
    return isRE ? new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i") : query;
  }
  var queryDialog =
    'Search: <input type="text" style="width: 10em"/> <span style="color: #888">(Use /re/ syntax for regexp search)</span>';
  function doSearch(cm, rev) {
    var state = getSearchState(cm);
    if (state.query) return findNext(cm, rev);
    var initial = getSingleLineSel(cm);
    dialog(cm, queryDialog, "Search for:", initial, function(query, shiftKey) {
      cm.operation(function() {
        if (!query) return;
        state.query = parseQuery(query);
        cm.removeOverlay(state.overlay, queryCaseInsensitive(state.query));
        state.overlay = searchOverlay(state.query);
        cm.addOverlay(state.overlay);
        state.posFrom = state.posTo = cm.getCursor();
        findNext(cm, shiftKey ? !rev : rev);
      });
    });
  }
  function findNext(cm, rev) {cm.operation(function() {
    var state = getSearchState(cm);
    var cursor = getSearchCursor(cm, state.query,
      // Subtract one when doing a reverse search, to make sure we make progress.
      rev ? { line: state.posFrom.line, ch: state.posFrom.ch - 1 }
          : state.posTo);
    if (!cursor.find(rev)) {
      cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0));
      if (!cursor.find(rev)) return;
    }
    cm.setSelection(cursor.from(), cursor.to());
    cm.scrollIntoView({from: cursor.from(), to: cursor.to()});
    state.posFrom = cursor.from(); state.posTo = cursor.to();
  });}
  function clearSearch(cm) {cm.operation(function() {
    var state = getSearchState(cm);
    if (!state.query) return;
    state.query = null;
    cm.removeOverlay(state.overlay);
  });}

  var replaceQueryDialog =
    'Replace: <input type="text" style="width: 10em"/> <span style="color: #888">(Use /re/ syntax for regexp search)</span>';
  var replacementQueryDialog = 'With: <input type="text" style="width: 10em"/>';
  var doReplaceConfirm = "Replace? <button>Yes</button> <button>No</button> <button>Stop</button>";
  function replace(cm, all) {
    var initial = getSingleLineSel(cm);
    dialog(cm, replaceQueryDialog, "Replace:", initial, function(query) {
      if (!query) return;
      query = parseQuery(query);
      var closeDialog;
      closeDialog = dialog(cm, replacementQueryDialog, "Replace with:", initial, function(text) {
        if (all) {
          cm.operation(function() {
            for (var cursor = getSearchCursor(cm, query); cursor.findNext();) {
              if (typeof query != "string") {
                var match = cm.getRange(cursor.from(), cursor.to()).match(query);
                cursor.replace(text.replace(/\$(\d)/, function(_, i) {return match[i];}));
              } else cursor.replace(text);
            }
            if (closeDialog) closeDialog();
          });
        } else {
          clearSearch(cm);
          var curCursor = cm.getCursor();
          // This way, if the initial replacement is selected, it'll be found.
          var pos = { line: curCursor.line, ch: curCursor.ch - 1 };
          var cursor = getSearchCursor(cm, query, pos);
          var advance = function() {
            var start = cursor.from(), match;
            if (!(match = cursor.findNext())) {
              cursor = getSearchCursor(cm, query);
              if (!(match = cursor.findNext()) ||
                  (start && cursor.from().line == start.line && cursor.from().ch == start.ch)) {
                if (closeDialog) closeDialog();
                return;
              }
            }
            cm.setSelection(cursor.from(), cursor.to());
            cm.scrollIntoView({from: cursor.from(), to: cursor.to()});
            confirmDialog(cm, doReplaceConfirm, "Replace?",
                          [function() {doReplace(match);}, advance]);
          };
          var doReplace = function(match) {
            cursor.replace(typeof query == "string" ? text :
                           text.replace(/\$(\d)/, function(_, i) {return match[i];}));
            advance();
          };
          advance();
        }
      });
    });
  }

  CodeMirror.commands.find = function(cm) {clearSearch(cm); doSearch(cm);};
  CodeMirror.commands.findNext = doSearch;
  CodeMirror.commands.findPrev = function(cm) {doSearch(cm, true);};
  CodeMirror.commands.clearSearch = clearSearch;
  CodeMirror.commands.replace = replace;
  CodeMirror.commands.replaceAll = function(cm) {replace(cm, true);};
})();
