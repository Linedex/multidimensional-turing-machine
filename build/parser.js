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

@break
  Creates a breakpoint for the delta function.
  The IDE will pause whenever the delta function is used. 
*/

/**
 * Parses all text for a TuringMachine++.
 */
function parseText(text) {

  deltas = {};
  tape = {};
  state = 'start';

  xIndex = 0;
  yIndex = 1;
  zIndex = 2;

  timeout = 100;
  colors = {};
  viewCoords = [];
  breakpoints = [];

  nDims = 2;

  text = text.replace(/\\\n/g,"");

  // text = text.replace(/{\\\n/,"");

  // (?<keep>{[^{}\n]*)\n

  // Iterate over all configs
  for (match of text.matchAll(/^#--(?<line>.*)/gm)) {
    line = match.groups['line'];
    parseConfig(line);
  }

  // Iterate over all non comment lines
  for (match of text.matchAll(/^[^\S\n]*(?<line>[^#\s\n]+[^#\n]*[^#\s\n]+)/gm)) {
    line = match.groups['line'];
    parseGenerators(line);
  }

  // Set the head position to all zeros
  head = Array.from({ length: nDims }, x => 0);

  // Reset tape bounds
  tapeBoundsMin = [...head];
  tapeBoundsMax = [...head];

  // Update tape bounds if the tape already has symbols on it
  for (let cell in tape) {
    // Parse cell into a Number Array
    cell = cell.split(',').map(x=>parseInt(x));
    for (let i = 0; i < nDims; i++) {
      tapeBoundsMin[i] = Math.min(cell[i],tapeBoundsMin[i])
      tapeBoundsMax[i] = Math.max(cell[i],tapeBoundsMax[i])
    }
  }
}



/**
 * Comments at the top of the file used to load IDE settings.
 * Does not impact how the TM++ code functions.
 * 
 * [WIP]
 * #viewport <width-dim-num> [height-dim-index] [layer-dim-index] [[<fixed-dim-index>=<value; default=0>] ...]
 *    Used to view 1D, 2D, 3D views
 * 
 * #grid (true|false)
 *    Show or hide the gridlines
 * 
 * #color <symbol> <html-color>
 *    Set the color of a symbol
 * 
 * #break [state=<state>] [symbol=<symbol>]
 *    Creates a breakpoint whenever the provided values matches the current values during runtime.
 * 
 * @param {string} text The full input text
 */
function parseConfig(line) {

  // Strings before and after first section of spaces
  var keyword, args

  [keyword, args] = line.trim().split(/(?<=^\S*)\s+/);

  switch (keyword) {

    case "start":
      state = args;
      break;

    case "color":
      args = args.split(/\s+/);
      if (args[0] == "auto") {
        const step = 360 / args[1];  
        for (let i = 0; i < args[1]; i++) {
          colors[i+1] = "hsl(" + step * i + ",100%,50%)";
        }
      } else {
        colors[args[0]] = args[1];
      }
      break;

    case "grid":
      showGrid = args == "true";
      break;

    case "timeout":
      timeout = parseInt(args);
      break;

    case "break":
      args = args.split(/\s+/);
      breakpoints.push(args[0] + "," + args[1])
      break;

    case "view":
      args = args.split(/\s+/);
      for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
          // Save dimension index used for iteration when rendering the view
          case "x": case "X": xIndex = i; break;
          case "y": case "Y": yIndex = i; break;
          case "z": case "Z": zIndex = i; break;
          // Save dimension coord used for the view
          default: viewCoords[i] = parseInt(args[i]);
        }
      }
      break;

    case "tape":

      // Parse subkeyword and additional args
      [subkeyword, args] = args.trim().split(/(?<=^\S*)\s+/);
      args = args.trim().split(/\s+/);

      let newSymbol = args.slice(args.length - 1);

      switch (subkeyword) {

        case "fill":

          nDims = (args.length - 1) / 2;

          start = args.slice(0, nDims).map(Number); // Start values
          stop = args.slice(nDims, 2 * nDims).map(Number); // Stop values
          cell = [] // Current cell to fill 

          // Recursive N dimensional fill
          function fill(d) {
            if (d >= nDims) {
              tape[cell] = newSymbol;
              return;
            }
            for (let i = start[d]; i < stop[d]; i++) {
              cell[d] = i;
              fill(d + 1);
            }
          }

          fill(0);
          break;

        // TODO Add non 2D support
        case "print":
          let lines = args[0].split("\\n");
          // Update bounds
          // tapeBoundsMax[1] = lines.length; //y
          // tapeBoundsMax[0] = Math.max(lines.map((line)=>{return line.length})); //x
          // Update tape
          for (let y = 0; y < lines.length; y++) {
            for (let x = 0; x < lines[y].length; x++) {
              cell = [x,y];
              tape[cell] = lines[y][x];
            }
          }
          break;

        case "set":
          cell = args.slice(0, args.length - 1).map(Number);
          tape[cell] = newSymbol;
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
 *      {:5}    => {0, 1, 2, 3, 4}
 *      {:5:}   => {0, 1, 2, 3, 4}
 *      {1:5}   => {1, 2, 3, 4}
 *      {:5:2}  => {0, 2, 4}
 *      {5::-1} => {5, 4, 3, 2, 1}
 *      {:5:-1} => {}
 * 
 * {(<value> | [<start=0>] : [<stop=0>] [: <step=1>]) [, ...]}
 *    A mixture of the two methods of generators.
 *    A "Generator List" can contain a "Generator Builder" or a <value>.
 *    Examples:
 *      {:5}    => {0, 1, 2, 3, 4}
 *      {0, :5} => {0, 0, 1, 2, 3, 4}
 * 
 * {[<arg-name>:<arg-value>;] ... <generator-entry>}
 *    Adds a argument to the generator that influences behavior.
 * 
 * {?:<track>; <generator-entry>}
 *    Designate the track of the generator.
 *    Generators with the same track number are run in parallel
 *    Generators with different track numbers are run for each value of the others
 *    Examples:
 *      a {1,2} b {3,4} c
 *        a 1 b 3 c
 *        a 1 b 4 c
 *        a 2 b 3 c
 *        a 2 b 4 c
 *      a {?:track0; 1,2} b {?:track1; 3,4} c
 *        a 1 b 3 c
 *        a 1 b 4 c
 *        a 2 b 3 c
 *        a 2 b 4 c
 *      a {?:track0; 1,2} b {?:track0; 3,4} c
 *        a 1 b 3 c
 *        a 2 b 4 c
 * 
 * {@:<symbols>; <generator-entry>}
 *    Designate the symbols of the generator.
 *    Symbols are sperated by a comma.
 *    The symbol to use is calculated by the generator value mod the number of symbols
 *    Examples:
 *      {@:a,b,c; 0,2,1}  => {a, c, b}
 *      {@:a,b,c; 1,4,-2} => {b, b, b}
 * 
 * [track=<track>;] [symbols=<symbols>;] (<value> | [<start=0>] : [<stop=0>] [: <step=1>]) [, ...]
 *    The full syntax of a generator.
 *    
 * @param {string} line A single line containing a generator 
 */
function parseGenerators(line) {

  // Extract first non embedded brackets
  // generator = line.match(/\{[^\{\}]*?\}/)

  // The first non embedded generator
  var generator = line.match(/{(?:\?:(?<track>[^{};]*);)?(?:@:(?<symbols>[^{};]*);)?(?<gen>[^{}]+)}/);

  // No generator is found, skip
  if (generator == null) {
    parseMachine(line)
    return
  }

  // The track of the first generator
  const track = generator.groups.track;

  // regular expression to extarct all generators on the same track
  const reg = RegExp('{\\?:' + track + ';(?:@:(?<symbols>[^{};]*);)?(?<gen>[^{}]+)}')

  // The line split across all generators on the same track
  var segs = [line]

  var genEntries = []
  var genSymbols = []

  // Extract all generators with the same track
  do {
    parseGenerators
    // Extract last segment
    const seg = segs.pop()

    split = seg.split(generator[0])

    // Split the segment along the generator
    segs.push(...[split.shift(), split.join(generator[0])])

    genEntries.push(generator.groups.gen.split(","))

    if (generator.groups.symbols != undefined) {
      genSymbols.push(generator.groups.symbols.split(","))
    } else {
      genSymbols.push(null)
    }

    // Find next generator
    generator = segs[segs.length - 1].match(reg);

  } while (generator != null)

  // Expand all generator builders into generator lists
  var newGenEntries = []

  for (let i = 0; i < genEntries.length; i++) {
    newGenEntries[i] = []
    for (value of genEntries[i]) {

      // Value is a range
      if (value.includes(":")) {

        // Divide into subvalues for start, end, step
        // All subvalues are integers
        subvalues = value.split(":")

        start = parseInt(subvalues[0])
        end = parseInt(subvalues[1])

        if (isNaN(start)) {
          start = 0;
        }

        // Check of optional third element is included
        if (subvalues.length == 3) {
          step = parseInt(subvalues[2])
        } else {
          step = 1;
        }

        // Reverse if iteration is negative
        // TODO optimize
        if (step > 0) {
          for (let k = start; k < end; k += step) {
            newGenEntries[i].push(k)
          }
        } else {
          for (let k = start; k > end; k += step) {
            newGenEntries[i].push(k)
          }
        }

      } else {
        // Value is just a normal value
        newGenEntries[i].push(value)
      }
    }
  }

  genEntries = newGenEntries

  // Construct the new line with the values inserted
  for (let i = 0; i < genEntries[0].length; i++) {
    newLine = segs[0]
    for (let j = 0; j < genEntries.length; j++) {

      // Replace generator with its symbol or value
      if (genSymbols[j] != null) {
        n = genSymbols[j].length
        index = ((genEntries[j][i] % n) + n) % n
        newLine += genSymbols[j][index]
      } else {
        newLine += genEntries[j][i]
      }

      newLine += segs[j + 1]
    }

    // Parse the resulting line incase it also contains a generator
    parseGenerators(newLine);

  }
}


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
  const args = line.split(/\s+/);

  // Calculate the number of dimensions as the largest dimension index value plus one
  for (let i = 4; i < args.length; i += 2) {
    dim = parseInt(args[i]);
    if (dim + 1 > nDims) {
      nDims = dim + 1;
    }
  }

  deltas[[args[0], args[1]]] = args.slice(2);
}