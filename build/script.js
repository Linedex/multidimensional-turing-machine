/*
 * Code for the TuringMachine++ itself
 */



// TuringMachine++ varibles
var deltas;
var tape;
var head;
var state;

// The tape dimension indicies to render as x,y,z
var xIndex;
var yIndex;
var zIndex;

var nDims; // Number of dimensions the machine extends into
var curIteration; // Number of steps progressed
var tapeBoundsMin; // Array of min index values for all dimensions
var tapeBoundsMax; // Array of max index values for all dimensions
var viewCoords; // Coords of viewport for non x,y,z dimensions
var colors; // The render colors of each symbol
var showGrid = true;
var timeout = 100; // cycles until forced termination
var breakpoints;



/**
 * Display an error message
 * 
 * @param {string} text The text to display
 */
function dispError(text) {
  alert(text);
}



/**
 * Loads the text from the editor and passes it to be parsed
 */
function parseMachine() {
  // Get code from editor
  const text = editor.getValue();
  parseText(text);
} 



/**
 * Run the TuringMachine++ until timeout or a breakpoint.
 */
function runMachine() {
    
  for (let i = 0; i < timeout; i++) {

    // Run machine and test if it hit a breakpoint
    if (!stepMachine()) {
      break;
    }
   }

  draw();
}



/**
 * Progress the machine by a single action
 */
function stepMachine() {
  // Check that current tape position is valid
  if (!(head in tape)) {
    tape[head] = "_"
  }
  
  // Delta index for state, symbol, head changes
  var stateSymbol = [state, tape[head]];
  
  // Set new state and write new symbol
  // state = deltas[state_symbol][0]
  // tape[head] = deltas[state_symbol][1]
  // var moves = deltas[state_symbol].slice(2)

  if (!(stateSymbol in deltas)) {
    dispError(stateSymbol + " is not a valid transition");
  }

  [state, tape[head], ...moves] = deltas[stateSymbol]

  // Update state display
  document.getElementById("state").innerHTML = state

  // Remove _ from the tape
  if (tape[head] == "_") {
    delete tape[head]
  }

  // Update tape bounds
  for (let i = 0; i < nDims; i++) {
    tapeBoundsMin[i] = Math.min(head[i],tapeBoundsMin[i])
    tapeBoundsMax[i] = Math.max(head[i],tapeBoundsMax[i])
  }

  // Change head position
  for (var j = 0; j < moves.length; j+=2) {
    
    // Move head +/- for the dimension number
    if      (moves[j+1] == "+") {head[moves[j]]++} 
    else if (moves[j+1] == "-") {head[moves[j]]--}
  }

  // Signal that the machine has encountered a breakpoint
  if (breakpoints.includes(stateSymbol.toString())) {
    return false;
  }
  
  return true;
}