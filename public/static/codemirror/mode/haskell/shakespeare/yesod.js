CodeMirror.defineMode("yesod", function(config) {
  return CodeMirror.multiplexingMode(
    CodeMirror.getMode(config, "haskell"),
    // Routes
    {open: "[parseRoutes|", close: "|]",
     mode: CodeMirror.getMode(config, "routes"),
     delimStyle: "delimit"},
    // Hamlet
    {open: /\[[iws]?hamlet\|/, close: "|]",
     mode: CodeMirror.getMode(config, "hamlet"),
     delimStyle: "delimit"},
    // Lucius
    {open: "[lucius|", close: "|]",
     mode: CodeMirror.getMode(config, "lucius"),
     delimStyle: "delimit"},
    // Cassius
    {open: "[cassius|", close: "|]",
     mode: CodeMirror.getMode(config, "cassius"),
     delimStyle: "delimit"},
    // Julius
    {open: "[julius|", close: "|]",
     mode: CodeMirror.getMode(config, "julius"),
     delimStyle: "delimit"},
    // FALLBACK
    {open: /\[[^| ]+\|/, close: "|]",
     mode: CodeMirror.getMode(config, "text/plain"),
     delimStyle: "delimit"}
  );
});

