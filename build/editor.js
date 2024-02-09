/*
 * Code for the TuringMachine++ code editor 
 */

/*  TODO
    buffers?
    folding?
    linting
    marker (adds #@break)
    indented wrapped line
    Search/Replace
    Theme Demo
*/ 

// Code syntax styling
// The regex matches the token, the token property contains the type
// https://codemirror.net/5/demo/simplemode.html
CodeMirror.defineSimpleMode("tm++", {
    
    // The start state contains the rules that are initially used
    start: [

      // Config comment
      {regex: /(#--)(\w+)/, token: ["comment", "keyword"]},
      {regex: /\s*(?:fill|set|to|with)/, token: "keyword"},
      {regex: /#.*/, token: "comment"},

      // Full Line
      {regex: /^(\s*[^\d\s+-]\S*\s+)(\S+\s+)(\S+\s+)(\S+)/, 
       token: ["variable-1", "string", "variable-1", "string"]},

      {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
      // {regex: /(?:start|color|timeout|grid|view)\b/, token: "keyword"},
      {regex: /true|false|null|undefined/, token: "atom"},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},      
      
      // Generators
      // {regex: /[:;,]+/, token: "operator"},
      {regex: /[+-]+/, token: "variable-2"},
      
      // {regex: /{/, token: "string", next: "generator"},

      // Indent and dedent properties guide autoindentation
      {regex: /[\{\[\(]/, indent: true},
      {regex: /[\}\]\)]/, dedent: true},

      // {regex: /[a-zA-Z]\S*/, token: "variable"},

    ],

    // The multi-line generator state.
    // generator: [
    //     {regex: /[:;,]/, token: "variable-3"},
    //     {regex: /}/, token: "string", next: "start"},
    //     {regex: /[^:;,}]/, token: "string"}
    // ],

    // The multi-line comment state.
    // comment: [
    //   {regex: /.*?\*\//, token: "comment", next: "start"},
    //   {regex: /.*/, token: "comment"}
    // ],

    // The meta property contains global information about the mode. It
    // can contain properties like lineComment, which are supported by
    // all modes, and also directives like dontIndentStates, which are
    // specific to simple modes.
    meta: {
      dontIndentStates: ["comment"],
      lineComment: "#"
    }
});

// Replace the textarea with CodeMirror
var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: 'tm++',
    theme: 'monokai',
    lineNumbers: true,
    showMatchesOnScrollbar: true,
    autoCloseBrackets: true, // addon/edit/closebrackets.js
    styleActiveLine: true, // addon/selection/active-line.js
    matchBrackets: true, // edit/matchbrackets.js
    // extraKeys: {"Alt-F": "findPersistent"},
    scrollbarStyle: "simple",
    gutters: ["CodeMirror-linenumbers", "breakpoints"]
});

// Replace tab with spaces
editor.setOption("extraKeys", {
  Tab: function(cm) {
    var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
    cm.replaceSelection(spaces);
  }
});

editor.on("gutterClick", function(cm, n) {
  var info = cm.lineInfo(n);
  cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
});

function makeMarker() {
  var marker = document.createElement("div");
  marker.style.color = "#822";
  marker.innerHTML = "●";
  return marker;
}