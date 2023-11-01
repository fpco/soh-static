CodeMirror.defineMode("julius", function(config) {
  return CodeMirror.shakespeare(config, "text/javascript");
});
CodeMirror.defineMIME("text/julius", "julius");

