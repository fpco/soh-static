// Highlighting text that matches the selection
//
// Defines an option highlightSelectionMatches, which, when enabled,
// will style strings that match the selection throughout the
// document.
//
// The option can be set to true to simply enable it, or to a
// {minChars, style, showToken} object to explicitly configure it.
// minChars is the minimum amount of characters that should be
// selected for the behavior to occur, and style is the token style to
// apply to the matches. This will be prefixed by "cm-" to create an
// actual CSS class name. showToken, when enabled, will cause the
// current token to be highlighted when nothing is selected.

(function() {
  var DEFAULT_MIN_CHARS = 2;
  var DEFAULT_TOKEN_STYLE = "matchhighlight";
  var DEFAULT_DELAY = 100;

  function State(options) {
    if (typeof options == "object") {
      this.minChars = options.minChars;
      this.style = options.style;
      this.delay = options.delay;
      this.tokens = options.tokens;
    }
    if (this.style == null) this.style = DEFAULT_TOKEN_STYLE;
    if (this.minChars == null) this.minChars = DEFAULT_MIN_CHARS;
    if (this.delay == null) this.delay = DEFAULT_DELAY;
    this.overlay = this.timeout = null;
  }

  CodeMirror.defineOption("highlightSelectionMatches", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      var over = cm.state.matchHighlighter.overlay;
      if (over) cm.removeOverlay(over);
      clearTimeout(cm.state.matchHighlighter.timeout);
      cm.state.matchHighlighter = null;
      cm.off("cursorActivity", cursorActivity);
    }
    if (val) {
      cm.state.matchHighlighter = new State(val);
      highlightMatches(cm);
      cm.on("cursorActivity", cursorActivity);
    }
  });

  function cursorActivity(cm) {
    var state = cm.state.matchHighlighter;
    clearTimeout(state.timeout);
    state.timeout = setTimeout(function() {highlightMatches(cm);}, state.delay);
  }

  function highlightMatches(cm) {
    cm.operation(function() {
      var state = cm.state.matchHighlighter;
      if (state.overlay) {
        cm.removeOverlay(state.overlay);
        state.overlay = null;
      }
      if (cm.somethingSelected()) {
        var from = cm.getCursor("start");
        var to = cm.getCursor("end");
        line = cm.getLine(from.line);
        if (from.line == to.line && from.ch < to.ch && line) {
          var sliced = line.slice(from.ch, to.ch);
          for (var i = 0; i < state.tokens.length; ++i) {
            var token = state.tokens[i];
            if (token.regex.test(sliced)) {
              cm.addOverlay(state.overlay = makeOverlay(sliced, token.boundary, state.style));
            }
          }
        }
        return;
      }
    });
  }

  function boundariesAround(stream, re) {
    return (!stream.start || re.test(stream.string.charAt(stream.start - 1))) &&
      (stream.pos == stream.string.length || re.test(stream.string.charAt(stream.pos)));
  }

  function makeOverlay(query, hasBoundary, style) {
    return {token: function(stream) {
      if (stream.match(query) &&
          (!hasBoundary || boundariesAround(stream, hasBoundary)))
        return style;
      stream.next();
      stream.skipTo(query.charAt(0)) || stream.skipToEnd();
    }};
  }
})();
