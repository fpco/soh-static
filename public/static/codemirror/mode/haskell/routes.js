/* Example of the routes syntax this mode highlights -
 * /             UsersR         GET
 * /user/#Int    UserR:
 *   /              UserRootR   GET
 *   /delete        UserDeleteR POST
 */

CodeMirror.defineMode("routes", function() {

  function err(stream, state) {
    //console.log("ERR: "+stream.current());
    stream.skipToEnd();
    state.parsing = 0;
    return "error";
  }

  return {
    startState: function() {
      return {parsing:0, justDescended: false, lastRuleIndent:0};
    },
    token: function(stream, state) {

      // Variable for peeking ahead
      var next;

      // Ignore leading spaces
      if(stream.eatSpace()) return null;

      // Manage nesting
      var descend = false;
      if (state.lastRuleIndent < stream.indentation()) descend = true;
      state.lastRuleIndent = stream.indentation();

      // Make sure that nested routes are not empty
      if(state.justDescended && !descend) {
        state.justDescended = false;
        return err(stream,state);
      }
      state.justDescended = false;

      // Parse!

      // Start of URL pattern
      if(state.parsing === 0) {

        // Skip till end of route or a variable
        if(stream.match(/[0-9a-zA-Z\/]*\/[0-9a-zA-Z]*/)) {
          next = stream.peek();
          //console.log("0: "+next);
          // URL ended
          if(next==='*'||next==='#') state.parsing = 1;
          // URL variable
          else state.parsing = 2;
          //console.log("0: "+state.parsing);
          return "string-2";
        }

        // Else error
        return err(stream,state);
      }

      // Variable
      if(state.parsing === 1) {

        // Simple variable
        if(stream.match(/#[A-Z][0-9a-zA-Z]*/)) {
          // End parsing URL pattern
          if(stream.peek() === ' ') state.parsing = 2;
          // Continue parsing URL pattern
          else state.parsing = 0;
          //console.log("1: "+state.parsing);
          return "atom";
        }

        // Catch all variable
        if(stream.match(/\*[A-Z][0-9a-zA-Z]*/)) {
          state.parsing = 2;
          return "atom";
        }

        // Else error
        return err(stream,state);
      }

      // Route Constructor
      if(state.parsing === 2) {
        if(stream.match(/[A-Z][0-9a-zA-Z]*/)) {
          //console.log("ROUTE: "+stream.current());
          state.parsing = 3;
          return "tag";
        }

        // Else error
        return err(stream,state);
      }

      // Http Verb
      if(state.parsing === 3) {
        next = stream.peek();

        // Nested Urls begin
        if(next === ':') {
          state.parsing = 0;
          state.justDescended = true;
          stream.next();
          stream.eatSpace();
          if(stream.eol()) return "variable";
          // We had some more stuff after the ':'
          stream.skipToEnd();
          return err(stream,state);
        }

        // Http Verb
        if(stream.match(/GET|PUT|POST|DELETE/)) {
          state.parsing = 0;
          return "keyword";
        }

        // Else error
        return err(stream,state);
      }

      // Invalid parsing state (may happen)
      return err(stream,state);
    }
  };
});

