/*
 * Code for the TuringMachine++ itself
 */

/*
#--color auto 8 
#--timeout 1000000
#--grid true
#--view x y
#--start U

##--color auto 12
# 1,1,0,1,1,1,0,0,0,0,0,1,1,0,1,1

# Extended Langton's Ant
{?:d;U,R,D,L} \
{?:r;_,1:9} \
{?:r;@:{?:d;L,U,R,D},{?:d;R,D,L,U};0,1,1,1,1,1,0,0,1} \
{?:r;1:9,_} \
{?:d;0,1,0,1} \
{?:r;@:{?:d;-,-,+,+},{?:d;+,+,-,-};0,1,1,1,1,1,0,0,1}
*/

/*
{
  &: d; 
  @: U,R,D,L
} {
  &: r; 
  @: _,1:12;
} {
  &: r; 
  %: {&:d; L,U,R,D},{&:d; R,D,L,U};
  @: {?:ant; 1,1,0,1,1,1,0,0,0,0,0,1,1,0,1,1}
} {
  &: r;
  @: 1:12,_
} {
  &: d;
  @: 0,1,0,1
} {
  &: r;
  %: {&:d; -,-,+,+},{&:d; +,+,-,-};
  @: {!:ant}
}
*/



/*
#--timeout 0
#--grid true
#--view x y
#--start AR
#--tape print 1011\n1101

# Move to the far right
AR {?:0;:2} AR {?:0;:2} 0 +
AR _ A_0 _ 0 -

# Add first value to carry 
A_0 0 A00 0 1 +
A_0 1 A01 1 1 +
A_1 0 A01 0 1 +
A_1 1 A10 1 1 +

# Add second value
A00 0 A00 0 1 +
A00 1 A01 1 1 +
A01 0 A01 0 1 +
A01 1 A10 1 1 +
A10 0 A10 0 1 +
A10 1 A11 1 1 +

# A_{?:0;:2} {?:0;:2} A{?:0;:2}{?:0;:2} {?:0;:2}

# a b cs
# 0 0 00
# 0 1 01
# 0 2 02
# 1 0 01
# 1 1 02
# 1 2 10
# 2 0 02
# 2 1 10
# 2 2 11
# a {0} c{012}
# a {1} c{120}
# a {2} c{201}
# a {:3} c{@:0,1,2;{:3}:{3:6}}

# Write sum
A{?:c;:2}{?:s;:2} _ A{?:c;:2}_ {?:s;:2} 0 - 1 -

# Swap registers
A{?:c;:2}_ {?:x;:2} A_{?:c;:2} {?:x;:2} 1 -

# Move to write carry bit
A{?:c;:2}_ _ A{?:c;:2} _ 1 +

# Write carry bit
A{?:c;:2} _ A {?:c;:2}
*/



/*
#--timeout 0
#--grid true
#--view x y 0
#--start AR

# Number 1
#--tape set 0 0 0 1
#--tape set 1 0 0 0
#--tape set 2 0 0 1
#--tape set 3 0 0 1

# Number 2
#--tape set 0 0 1 1
#--tape set 1 0 1 1
#--tape set 2 0 1 0
#--tape set 3 0 1 1

# Move to the far right
AR {?:0;:2} AR {?:0;:2} 0 +
AR _ A_0 _ 0 -

# Add first value to carry 
A_0 0 A00 0 2 +
A_0 1 A01 1 2 +
A_1 0 A01 0 2 +
A_1 1 A10 1 2 +

# Add second value
A00 0 A00 0 2 - 1 +
A00 1 A01 1 2 - 1 +
A01 0 A01 0 2 - 1 +
A01 1 A10 1 2 - 1 +
A10 0 A10 0 2 - 1 +
A10 1 A11 1 2 - 1 +

# Write sum
A{?:c;:2}{?:s;:2} _ A_{?:c;:2} {?:s;:2} 0 - 1 -

# Move to write carry bit
A_{?:c;:2} _ A{?:c;:2} _ 1 +

# Write carry bit
A{?:c;:2} _ A {?:c;:2}
*/



/*
#--timeout 0
#--view x y
#--start R
#--tape print 1011

# Do mathz
R {?:0;:2,_} R {?:0;:2,0} 0 +
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

} 



/**
 * Run the TuringMachine++ for n iterations.
 */
function run() {
    
  // Update tape
  for (let i = 0; i < timeout; i++) {

    stepMachine();

    // Delta index for state, symbol, head changes
    var stateSymbol = [state, tape[head]];

    if (breakpoints.includes(stateSymbol.toString())) {
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
}