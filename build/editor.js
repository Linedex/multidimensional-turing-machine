/*
 * Code for the TuringMachine++ code editor 
 */

// Code syntax styling
// The regex matches the token, the token property contains the type
// https://codemirror.net/5/demo/simplemode.html
CodeMirror.defineSimpleMode("tm++", {
    
    // The start state contains the rules that are initially used
    start: [

      // String
      {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
      
      // You can match multiple tokens at once. Note that the captured
      // groups must span the whole string in this case
      // {regex: /(function)(\s+)([a-z$][\w$]*)/, token: ["keyword", null, "variable-2"]},
      
      // Special keywords
      {regex: /(?:#color|#timeout|#grid)\b/, token: "keyword"},
      {regex: /true|false|null|undefined/, token: "atom"},
      
      // Numbers
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      
      // Comments
      {regex: /#.*/, token: "comment"},
      // {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
      // A next property will cause the mode to move to a different state
      
      // Generators
      // {regex: /[:;,]+/, token: "operator"},
      
      {regex: /{/, token: "string", next: "generator"},

      // Indent and dedent properties guide autoindentation
      {regex: /[\{\[\(]/, indent: true},
      {regex: /[\}\]\)]/, dedent: true},

      // Everything else is a variable
      {regex: /[a-z$][\w$]*/, token: "variable"},

      // TODO add this for top line comments or generators
      // You can embed other modes with the mode property. This rule
      // causes all code between << and >> to be highlighted with the XML mode.
      // {regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
    ],

    // The multi-line generator state.
    generator: [
        {regex: /[:;,]/, token: "variable-3"},
        {regex: /}/, token: "string", next: "start"},
        {regex: /[^:;,}]/, token: "string"}
    ],

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
    lineNumbers: true,
    theme: 'monokai',
});