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
      {regex: /\s*(#--)(\w+)/, token: ["comment", "keyword"], sol: true},
      // {regex: /\s*(?:fill|set|to|with)/, token: "keyword"},
      {regex: /#.*/, token: "comment"},

      // Full Line
      {regex: /\s*(?=\S)/, token: "keyword", next: "state", sol: true},

      {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
      {regex: /true|false|null|undefined/, token: "atom"},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},      
      
      {regex: /{/, token: "bracket", push: "generator"},

      {regex: /[\[\(]/, indent: true},
      {regex: /[\]\)]/, dedent: true},
    ],

    state: [
      {regex: /\s+/, next: "symbol"},
      {regex: /{/, token: "bracket", indent: true, push: "stateGenerator"},
      {regex: /[^\s{]+/, token: "variable-2"},
    ],

    symbol: [
      {regex: /\s+/, next: "newState"},
      {regex: /{/, token: "bracket", indent: true, push: "symbolGenerator"},
      {regex: /[^\s{]+/, token: "string"},
    ],

    newState: [
      {regex: /\s+/, next: "newSymbol"},
      {regex: /{/, token: "bracket", indent: true, push: "stateGenerator"},
      {regex: /[^\s{]+/, token: "variable-2"},
    ],

    newSymbol: [
      {regex: /\s+/, next: "start"},
      {regex: /{/, token: "bracket", indent: true, push: "symbolGenerator"},
      {regex: /[^\s{]+/, token: "string"},
    ],

    stateGenerator: [
      {regex: /}/, token: "bracket", dedent: true, pop: true},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      {regex: /[^\s}]/, token: "variable-2"},
    ],

    symbolGenerator: [
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      {regex: /\w+(?![^};]*;[^};]*})/, token: "string"}, // characters representing symbols
      {regex: /\w+(?![^};]*;[^};]*})/, token: "string"}, // characters representing symbols
      {regex: /}/, token: "bracket", dedent: true, pop: true},
      // {regex: /[^\s}]/, token: "string"},
    ],

    generator: [
      {regex: /}/, token: "bracket", dedent: true, pop: true},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      {regex: /[^\s}]/, token: "string"},
    ],

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
    // theme: 'monokai',
    theme: 'yonce',
    keyMap: "sublime",
    lineNumbers: true,
    showMatchesOnScrollbar: true,
    autoCloseBrackets: true, // addon/edit/closebrackets.js
    styleActiveLine: true, // addon/selection/active-line.js
    matchBrackets: true, // edit/matchbrackets.js
    extraKeys: {"Alt-F": "findPersistent"},
    // lineWrapping: true,
    scrollbarStyle: "simple",
    gutters: ["CodeMirror-linenumbers", "breakpoints"],
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