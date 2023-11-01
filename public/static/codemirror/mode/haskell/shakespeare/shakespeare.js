// Adds Shakespearian interpolation to any mode
CodeMirror.shakespeare = function(config, mode) {
  var outerMode = null;
  if("string" == typeof mode) {
    outerMode = CodeMirror.getMode(config, mode);
  } else if("object" == typeof mode) {
    outerMode = mode;
  }
  return CodeMirror.multiplexingMode(
    outerMode,
    {open: /(\#|\@|\^)\{/, close: "}",
     mode: CodeMirror.getMode(config, "haskell"),
     delimStyle: "delimit"}
  );
};

