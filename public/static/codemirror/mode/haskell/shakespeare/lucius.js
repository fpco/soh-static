// Lucius is Shakesperean CSS with nesting
CodeMirror.defineMode("lucius", function(config) {
  return CodeMirror.shakespeare(config, CodeMirror.cssMode(config, true));
});
CodeMirror.defineMIME("text/lucius", "lucius");

