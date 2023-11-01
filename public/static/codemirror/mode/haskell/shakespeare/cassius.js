// Cassius is Shakesperean CSS with indentation and nesting
CodeMirror.defineMode("cassius", function(config) {
  return CodeMirror.shakespeare(config, CodeMirror.cssMode(config, false, true));
});
CodeMirror.defineMIME("text/cassius", "cassius");

