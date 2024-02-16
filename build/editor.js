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
      // {regex: //, token: "bracket", dedent: true, pop: true},
      {regex: /}/, token: "bracket", dedent: true, pop: true},
      {regex: /{/, token: "bracket", indent: true, push: "stateGenerator"},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      {regex: /.:/, token: "tag"},
      {regex: /[^{}:,;]/, token: "variable-2"},
    ],

    symbolGenerator: [
      {regex: /}/, token: "bracket", dedent: true, pop: true},
      {regex: /{/, token: "bracket", indent: true, push: "symbolGenerator"},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      // {regex: /\w+(?![^};]*;[^};]*})/, token: "string"}, // characters representing symbols
      {regex: /.:/, token: "tag"},
      {regex: /[^{}:,;]/, token: "string"},
    ],

    generator: [
      {regex: /}/, token: "bracket", dedent: true, pop: true},
      {regex: /{/, token: "bracket", indent: true, push: "generator"},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      {regex: /.:/, token: "tag"},
      {regex: /[^{}:,;]/, token: "variable"},
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
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: 'tm++',
    theme: 'yonce',
    keyMap: "sublime",
    extraKeys: {"Alt-F": "findPersistent"},
    // lineWrapping: true,
    lineNumbers: true,
    gutters: ["CodeMirror-linenumbers", "breakpoints"],
    scrollbarStyle: "simple",
    showMatchesOnScrollbar: true,
    autoCloseBrackets: true, // addon/edit/closebrackets.js
    styleActiveLine: true, // addon/selection/active-line.js
    matchBrackets: true, // edit/matchbrackets.js
});

// Replace tab with spaces
editor.setOption("extraKeys", {
  Tab: function(cm) {
    var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
    cm.replaceSelection(spaces);
  }
});

// Add marker when gutter is clicked
editor.on("gutterClick", function(cm, n) {
  var info = cm.lineInfo(n);
  cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
});

// Function to generate marker
function makeMarker() {
  var marker = document.createElement("div");
  marker.style.color = "#822";
  marker.innerHTML = "●";
  return marker;
}

// Add shortcut for save function
CodeMirror.commands.save = saveCode

// Save code
function saveCode() {
  const fileName = "myfile.txt";
  const fileText = editor.getValue();
  const file = new Blob([fileText], {
    type: "text/plain;charset=utf-8"
  });

  // Create a link and set the URL using `createObjectURL`
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = URL.createObjectURL(file);
  link.download = fileName;

  // Link must be added to the DOM so it can be clicked
  document.body.appendChild(link);
  link.click();

  // To make this work on Firefox we need to wait
  // a little while before removing it.
  setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.parentNode.removeChild(link);
  }, 0);
}

function openCode() {
  file = showOpenFilePicker();
}