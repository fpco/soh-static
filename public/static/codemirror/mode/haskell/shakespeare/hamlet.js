// While Hamlet is different from HTML, in practice it seems to work fine with
// the stock HTML mode.
CodeMirror.defineMode("hamlet", function(config) {
  var htmlMode = CodeMirror.getMode(config, {name: "htmlmixed", allowIncompleteAttributes: true});
  return CodeMirror.shakespeare(config, htmlMode);
});
CodeMirror.defineMIME("text/hamlet", "hamlet");

