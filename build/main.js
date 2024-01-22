
// Gloabal TuringMachine++ varibles
deltas = {}
tape = {}
head = [0,0]
state = 'UNKNOWN'

// The tape dimension indicies to render as x,y,z
xIndex = 0;
yIndex = 1;
zIndex = 2;


colors = {} // The render colors of each symbol
showGrid = true;
timeout = 11000;





// Load a 2D slice of the TM++ onto the canvas
document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Initial grid properties
  let cellSize = 50;
  let panX = 0;
  let panY = 0;
  let scale = 1;

  function drawGrid() {

    // Reset canvas
    ctx.setTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = Math.min(scale, 1/scale); // Prevent lineweight from scaling unless zoomed far out 
    ctx.setTransform(scale, 0, 0, scale, panX, panY); // Scale to current view
    
    // Extra cells to display outside of viewport
    const offset = 1;

    // Calculate the boundaries of the tape's viewport  
    const xMin = parseInt((0 - panX) / (cellSize * scale)) - offset;
    const xMax = parseInt((canvas.width - panX) / (cellSize * scale)) + offset;
    const yMin = parseInt((0 - panY) / (cellSize * scale)) - offset;
    const yMax = parseInt((canvas.height - panY) / (cellSize * scale)) + offset;
    
    // Draw gridlines
    if (showGrid) {
      // Draw vertical gridlines
      for (let x = xMin; x <= xMax; x++) {
        const xPos = x * cellSize;
        ctx.beginPath();
        ctx.moveTo(xPos, yMin * cellSize);
        ctx.lineTo(xPos, yMax * cellSize);
        ctx.stroke();
      }
      // Draw horizontal gridlines
      for (let y = yMin; y <= yMax; y++) {
        const yPos = y * cellSize;
        ctx.beginPath();
        ctx.moveTo(xMin * cellSize, yPos);
        ctx.lineTo(xMax * cellSize, yPos);
        ctx.stroke();
      }
    }

    // Draw all cells in the viewport
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {

        // Current cell
        var head = [0,0]
        head[xIndex] = x;
        head[yIndex] = y;

        // Draw cell's symbol
        if (head in tape) {

          // Position of cell
          const xPos = x * cellSize;
          const yPos = y * cellSize;
          const symbol = tape[head]
          
          // Fill in symbol color
          if (symbol in colors) {
            ctx.fillStyle = colors[symbol];
            ctx.fillRect(xPos, yPos, cellSize, cellSize);
          } else {
            ctx.textAlign = "center";
            ctx.fillStyle = '#abb2bf';
            ctx.fillText(symbol, xPos + 0.5 * cellSize, yPos + 0.5 * cellSize);
          }
        } 
      }
    }

    // Draw head
    const xPos = head[xIndex] * cellSize;
    const yPos = head[yIndex] * cellSize;
    ctx.lineWidth = 2 * Math.min(scale, 1/scale); // Prevent lineweight from scaling unless zoomed far out 
    ctx.strokeStyle = "red";
    ctx.strokeRect(xPos, yPos, cellSize, cellSize);
  }

  function handleZoom(event) {
    const zoomFactor = 0.1;
    const delta = event.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;
    scale *= delta;
    drawGrid();
  }

  function handlePan(event) {
    if (event.buttons === 1) {
      panX += event.movementX;
      panY += event.movementY;
      drawGrid();
    }
  }

  function handleMiddeClick(event) {
    if (event.button === 1) {
      panX = panY = 0;
      scale = 1;
      drawGrid();
    }
  }

  canvas.addEventListener('auxclick',handleMiddeClick);
  canvas.addEventListener("wheel", handleZoom);
  canvas.addEventListener("mousemove", handlePan);

  parse(); // Initial parse

  drawGrid(); // Initial draw
});






























function onload() {}

/* 
===SYNTAX====
General notations used for documentation.

plain text	          Enter this literally, exactly as shown.
<arg-name>            An argument that should be replaced with an appropriate value.
<arg-name=default>    An argument with a default value.
[entry]	              This entry is optional.
(entry|entry)	        (Required) Pick one of the entries that is shown.
[entry|entry]	        (Optional) Pick one of the entries that is shown.
entry ...	            Prior entry repeats.

====ANNOTATIONS====
Placed at the end of a delta to signify IDE intervention.
Does not impact how the TM++ code functions.

@ break
  Creates a breakpoint for the delta function.
  The IDE will pause whenever the delta function is used. 
*/



/**
 * Loads and parses the textarea for the TuringMachine++.
 */
function parse() {
  const text = document.getElementById('inputTextArea').value;

  deltas = {}
  tape = {}
  head = [0,0]
  state = 'U' 

  // Selects all comments (alternate method of removal)
  // /((?<=\n)\s*)|(\s*(#.*))/g

  parseConfigs(text);

  // Iterate over all non comment lines
  for (noncom of text.matchAll(/^[^\S\n]*(?<line>[^#\s\n]+[^#\n]*[^#\s\n]+)/gm)) {
    line = noncom.groups['line']
    parseGenerators(line);
  }


  run(timeout);
}



/**
 * Comments at the top of the file used to load IDE settings.
 * Does not impact how the TM++ code functions.
 * 
 * #viewport <width-dim-num> [height-dim-index] [layer-dim-index] [[<fixed-dim-index>=<value; default=0>] ...]
 *    Used to view 1D, 2D, 3D views
 * 
 * #dispmode (text|pixels)
 *    Change how the viewport renders
 *    `pixels` renders each symbol as the color specified by `#color`
 * 
 * #grid (true|false)
 *    Show or hide the gridlines
 * 
 * #color <symbol> (<rgb>|<rgba>)
 *    Set the color of a symbol
 * 
 * #break [state=<state>] [symbol=<symbol>]
 *    Creates a breakpoint whenever the provided values matches the current values during runtime.
 * 
 * @param {string} text 
 */
function parseConfigs(text) {
  
  // All comments before first line
  const lines = text.match(/^(\s*#.*\n)+/g)[0].split("\n");

  timeout = 100;
  colors = {};

  for (let line of lines) {
    args = line.trim().split(/\s+/);
    switch (args[0].slice(1)) {

      case "color":
        colors[args[1]] = args[2]
        break;
      
      case "grid":
        showGrid = args[1] == "true"
        console.log(showGrid);
        break;

      case "timeout":
        timeout = parseInt(args[1]);
        break;
    }
  }
}



/**
 * Generators are contained within curly braces and compile to multiple delta functions.
 * Arguments within a generator are seperated by commas, colons, and semicolons.
 * 
 * {<generator-entry>}
 *    The required part of a generator. This can be set up in two ways as shown below.
 * 
 * {<value> [, ...]}
 *    "Generator List" Repeats for every listed value.
 * 
 * {[<start=0>] : [<stop=0>] [: <step=1>]}
 *    "Generator Builder" Repeats for all ints from `start` inclusive to `stop` exclusive.
 *    Examples:
 *      {:5}    = {0, 1, 2, 3, 4}
 *      {:5:}   = {0, 1, 2, 3, 4}
 *      {1:5}   = {1, 2, 3, 4}
 *      {:5:2}  = {0, 2, 4}
 *      {5::-1} = {5, 4, 3, 2, 1}
 *      {:5:-1} = {}
 * 
 * {(<value> | [<start=0>] : [<stop=0>] [: <step=1>]) [, ...]}
 *    A mixture of the two methods of generators.
 *    A "Generator List" can contain a "Generator Builder" or a <value>.
 *    Examples:
 *      {:5}    = {0, 1, 2, 3, 4}
 *      {0,:5}  = {0, 0, 1, 2, 3, 4}
 * 
 * {[<arg-name>:<arg-value>;] ... <generator-entry>}
 *    Adds a argument to the generator that influences behavior.
 * 
 * {#:<track>; <generator-entry>}
 * {track:<track>; <generator-entry>}
 *    Designate the track of the generator.
 *    Generators with the same track number are run in parallel
 *    Generators with different track numbers are run for each value of the others
 *    Examples:
 *      a {1,2} b {3,4} c
 *        a 1 b 3 c
 *        a 2 b 4 c
 *      a {#:t0;1,2} b {#:t1;3,4} c
 *        a 1 b 3 c
 *        a 1 b 4 c
 *        a 2 b 3 c
 *        a 2 b 4 c
 * 
 * {?:<symbols>; <generator-entry>}
 * {symbols:<symbols>; <generator-entry>}
 *    Designate the symbols of the generator.
 *    Symbols are sperated by a comma.
 * 
 * [track=<track>;] [symbols=<symbols>;] (<value> | [<start=0>] : [<stop=0>] [: <step=1>]) [, ...]
 *    The full syntax of a generator.
 *    
 * 
 * TODO 
 * recursion <3 for embeded calls
 * pass directly to parse machine if no {}
 * If a generator has the same tag, continue running
 * 
 * @param {string} line A single line containing a generator 
 */
function parseGenerators(line) {
  
  // Extract first non embedded brackets
  generator = line.match(/\{[^\{\}]*?\}/)

  // No generator is found, skip
  if (generator == null) {
    parseMachine(line)
    return
  }

  // /\{(?:(?<name>[^\{\};]*);)?(?:(?<symbols>[^\{\};]*);)?(?<gen>[^\{\}]+)\}/g

  /*
  (?<gen>\{(?<name>[^\{\}]*);[^\{\}]*?\})
  
  (
    (?<pass>[^\{\}]*)
    (?<gen1>\{\k<name>;[^\{\}]*?\})*
  )*
  */

  // left and right of first match
  lr = line.split(generator[0])
  l = lr[0]
  r = lr[1]

  // Args are seperated by a semicolon
  args = generator[0].slice(1,-1).split(";");

  // Final arg is the 
  generatorEntry = args[args.length-1].split(",")

  // Iterate over all values in the generator
  for (value of generatorEntry) {
    
    // Value is a range
    if (value.includes(":")) {

      // Divide into subvalues for start, end, step
      // All subvalues are integers
      subvalues = value.split(":")

      start = parseInt(subvalues[0])
      end = parseInt(subvalues[1])

      // Check of optional third element is included
      if (subvalues.length == 3) {
        step = parseInt(subvalues[2])
      }

      // Reverse if iteration is negative
      // TODO optimize
      if (step > 0) {
        for (let i=start; i<end; i+=step) {
          parseMachine(l + i + r)
        }
      } else {
        for (let i=start; i>end; i+=step) {
          parseMachine(l + i + r)
        }
      }

    } else {
      // Value is just a normal value
      parseMachine(l + value + r)
    }
  }
}
var start, end, step


/**
 * The tuples for all transition functions
 * 
 * <current-state> <current-symbol> <new-state> <new-symbol> (L|R)
 *    Original 1D Turing Machine Notation
 * 
 * <current-state> <current-symbol> <new-state> <new-symbol> [[<dim-index> (-|+)] ...]
 *    ND Turing Machine notation.
 * 
 * @param {string} text 
 */
function parseMachine(line) {
  console.log(line)
  const args = line.split(/\s+/);
  deltas[[args[0], args[1]]] = args.slice(2);
}



/**
 * Run the TuringMachine++ for n iterations.
 * 
 * @param {int} n The number of cycles to run the TuringMachine++.
 */
function run(n) {
    
  // Update tape
  for (let i=0; i<n; i++) {

    // Check that current tape position is valid
    if (!(head in tape)) {
      tape[head] = "_"
    }
    
    // Delta index for state, symbol, head changes
    // var state_symbol = [state, tape[head]]
    
    // Set new state and write new symbol
    // state = deltas[state_symbol][0]
    // tape[head] = deltas[state_symbol][1]
    // var moves = deltas[state_symbol].slice(2)

    [state, tape[head], ...moves] = deltas[[state, tape[head]]]
    
    // Remove _ from the tape
    if (tape[head] == "_") {
      delete tape[head]
    }
    
    // Change head position
    for (var j = 0; j < moves.length; j+=2) {
      
      // Move head +/- for the dimension number
      if      (moves[j+1] == "+") {head[moves[j]]++} 
      else if (moves[j+1] == "-") {head[moves[j]]--}
    }
  }
}