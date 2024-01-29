// Replace the textarea with CodeMirror
// var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
//     // mode: "javascript",
//     // lineNumbers: true,
//     extensions: [lineNumbers(), gutter({class: "cm-mygutter"})],
// });
// editor.save()

// import {basicSetup, EditorView} from "codemirror"
// import {javascript} from "@codemirror/lang-javascript"

// import {minimalSetup, EditorView} from "codemirror"

editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    // mode: "javascript",
    lineNumbers: true,
    theme: 'monokai',
    // tabSize: 2,
    // extensions: "minimalSetup",
});
editor.save();


// (function () {
//     'use strict';
  
//     //!editor
  
//     const {basicSetup} = CM["codemirror"];
//     const {EditorView, keymap} = CM["@codemirror/view"];
//     const {indentWithTab} = CM["@codemirror/commands"];
//     const {javascript} = CM["@codemirror/lang-javascript"];
  
//     const doc = `if (true) {
//     console.log("okay")
//   } else {
//     console.log("oh no")
//   }
//   `;
  
//     // var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
//     //     // mode: "javascript",
//     //     lineNumbers: true,
//     //     theme: 'monokai',
//     //     tabSize: 2,
//     //     extensions: "minimalSetup",
//     // });
//     // editor.save();

//     new EditorView({
//       doc,
//       extensions: [
//         basicSetup,
//         keymap.of([indentWithTab]),
//         javascript()
//       ],
//       parent: document.querySelector("#editor-container")
//     });
  
// })();
  

// import {basicSetup} from "codemirror"
// import {EditorView, keymap} from "@codemirror/view"
// import {indentWithTab} from "@codemirror/commands"
// import {javascript} from "@codemirror/lang-javascript"

// const doc = `if (true) {
//   console.log("okay")
// } else {
//   console.log("oh no")
// }`

// new EditorView({
//     doc,
//     extensions: [
//       basicSetup,
//       keymap.of([indentWithTab]),
//       javascript()
//     ],
//     parent: document.querySelector("#editor-container")
// })

// editor = CodeMirror(document.getElementById('editor'), {
//     doc,
//     extensions: [
//       basicSetup,
//       keymap.of([indentWithTab]),
//       javascript()
//     ],
// });
// editor.save();