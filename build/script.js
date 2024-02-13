/*
 * Code for the TuringMachine++ itself
 */

// Extended Langton's Ant
// {?:d;U,R,D,L} {?:r;_,1:9} {?:r;@:{?:d;L,U,R,D},{?:d;R,D,L,U};0,1,1,1,1,1,0,0,1} {?:r;1:9,_} {?:d;0,1,0,1} {?:r;@:{?:d;-,-,+,+},{?:d;+,+,-,-};0,1,1,1,1,1,0,0,1}
/*
#--color auto 8 
#--timeout 0
#--grid true
#--view x y
#--start U

# Langton's Ant
{?:d;U,R,D,L} \
{?:r;_,1:9} \
{?:r;@:{?:d;L,U,R,D},{?:d;R,D,L,U};0,1,1,1,1,1,0,0,1} \
{?:r;1:9,_} \
{?:d;0,1,0,1} \
{?:r;@:{?:d;-,-,+,+},{?:d;+,+,-,-};0,1,1,1,1,1,0,0,1}
*/

/*
#--color auto 12
#--timeout 1000000
#--grid true
#--view x y
#--start U

# Langton's Ant
{?:d;U,R,D,L} \
{?:r;_,1:12} \
{?:r;@:{?:d;L,U,R,D},{?:d;R,D,L,U};1,1,0,1,1,1,0,0,0,0,0,1,1,0,1,1} \
{?:r;1:12,_} \
{?:d;0,1,0,1} \
{?:r;@:{?:d;-,-,+,+},{?:d;+,+,-,-};1,1,0,1,1,1,0,0,0,0,0,1,1,0,1,1}
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
 * @param {string} text 
 */
function dispError(text) {
  alert(text);
}



/**
 * Loads the text from the editor and passes it to be parsed
 */
function parse() {
  
  // Get code from editor
  const text = editor.getValue();
  
  parseText(text);

  run(timeout);

} 



/**
 * Run the TuringMachine++ for n iterations.
 * 
 * @param {int} n The number of cycles to run the TuringMachine++.
 */
function run(n) {
    
  // Update tape
  for (let i = 0; i < n; i++) {

    updateStep();

    // Delta index for state, symbol, head changes
    var stateSymbol = [state, tape[head]];

    if (breakpoints.includes(stateSymbol.toString())) {
      i = 1000000000000000000;
    }
  }

  draw();
}

function updateStep() {
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
}