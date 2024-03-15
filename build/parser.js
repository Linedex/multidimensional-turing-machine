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





  // Reset all variables to defaults
  // TuringMachine++ varibles
  deltas = {};
  tape = {};
  head = null;
  state = 'start';

  // The tape dimension indicies to render as x,y,z
  xIndex = 0;
  yIndex = 1;
  zIndex = NaN;

  nDims = 2;
  curIteration = 0;
  tapeBoundsMin = null;
  tapeBoundsMax = null;
  viewCoords = [];
  colors = {};
  timeout = 10000;
  breakpoints = [];
  keyMap = {};


  // NEW





  // Remove newlines preceded by a backslash
  text = text.replace(/\\\n/g,"");

  configLines = []
  deltaLines = []

  lines = text.split('\n');

  // Extract sparce array keys
  keys = Object.keys(lines);

  for (let i of keys) {
    let line = lines[i];

    if (line.startsWith("#--")) {
      delete lines[i];
      delete keys[keys.indexOf(i)];
      // parseConfig(line);
    }

    // Test if the line is empty or only a comment
    else if (/^[\s]*(?:#.*)?$/.test(line)) {
      delete lines[i];
      delete keys[keys.indexOf(i)];
    }

    else if (/{/.test(line)) {
      lines 
      // unshift
    }
    
  }




  // OLD




  // Iterate over all configs
  for (match of text.matchAll(/^#--(?<line>.*)/gm)) {
    line = match.groups['line'];
    parseConfig(line);
  }

  // Extract all lines using regex
  // lines = text.matchAll(/^[^\S\n]*(?<line>[^#\s\n]+[^#\n]*[^#\s\n]+)/gm);
  // Convert to an array
  // lines = [...lines].map(x=>x[0]);

  // Iterate over all non comment lines
  for (match of text.matchAll(/^[^\S\n]*(?<line>[^#\s\n]+[^#\n]*[^#\s\n]+)/gm)) {
    line = match.groups['line'];
    parseLine(line);
  }

  // Set default zIndex to 3 if possible
  if (zIndex == NaN && nDims > 2) {
    zIndex = 2;
  }

  // Set the head position to all zeros
  head = Array.from({length: nDims}, x => 0);

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
 * #--view <width-dim-num> [height-dim-index] [layer-dim-index] [[<fixed-dim-index>=<value; default=0>] ...]
 *    Used to view 1D, 2D, 3D views
 * 
 * #--grid (true|false)
 *    Show or hide the gridlines
 * 
 * #--color <symbol> <html-color>
 *    Set the color of a symbol
 * 
 * #--break [state=<state>] [symbol=<symbol>]
 *    Creates a breakpoint whenever the provided values matches the current values during runtime.
 * 
 * @param {string} text The full input text
 */
function parseConfig(line) {

  // Strings before and after first section of spaces
  let keyword, args

  [keyword, args] = line.trim().split(/(?<=^\S*)\s+/);

  switch (keyword) {

    // Set the start state
    case "start":
      state = args;
      break;

    // Set the color of symbol
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

    // Set showGrid
    case "grid":
      showGrid = args == "true";
      break;

    // Set timeout
    case "timeout":
      timeout = parseInt(args);
      break;

    case "key":
      args = args.split(/\s+/);
      keyMap[args[0]] = args[1];
      break;

    // Add breakpoint
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
          case "z": case "Z": zIndex = i; viewCoords[i] = 0; break;
          // Save dimension coord used for the view
          default: viewCoords[i] = parseInt(args[i]);
        }
      }
      break;

    // Modify tape
    case "tape":
      // First arg describes type of modification
      let subkeyword
      // Parse subkeyword and additional args
      [subkeyword, args] = args.trim().split(/(?<=^\S*)\s+/);
      args = args.trim().split(/\s+/);
      // The 
      let newSymbol = args.pop();

      switch (subkeyword) {

        case "set":
          cell = args.map(Number);
          tape[cell] = newSymbol;
          break;

        case "print":
          defaultCell = args.map(Number);
          let lines = newSymbol.split("\\n");
          // Update tape
          for (let y = 0; y < lines.length; y++) {
            for (let x = 0; x < lines[y].length; x++) {
              cell = [...defaultCell]
              cell[0] += x;
              cell[1] += y;
              tape[cell] = lines[y][x];
            }
          }
          break;

        case "fill":
          nDims = args.length / 2;
          start = args.slice(0, nDims).map(Number); // Start values
          end = args.slice(nDims).map(Number); // Stop values
          cell = [] // Current cell to fill 
          // Recursive N dimensional fill
          function fill(d) {
            if (d >= nDims) {
              tape[cell] = newSymbol;
              return;
            }
            for (let i = start[d]; i < end[d]; i++) {
              cell[d] = i;
              fill(d + 1);
            }
          }
          fill(0);
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
 * {&:<track>; <generator-entry>}
 *    Designate the track of the generator.
 *    Generators with the same track number are run in parallel
 *    Generators with different track numbers are run for each value of the others
 *    Examples:
 *      a {1,2} b {3,4} c
 *        a 1 b 3 c
 *        a 1 b 4 c
 *        a 2 b 3 c
 *        a 2 b 4 c
 *      a {&:track0; 1,2} b {&:track1; 3,4} c
 *        a 1 b 3 c
 *        a 1 b 4 c
 *        a 2 b 3 c
 *        a 2 b 4 c
 *      a {&:track0; 1,2} b {&:track0; 3,4} c
 *        a 1 b 3 c
 *        a 2 b 4 c
 * 
 * {%:<symbols>; <generator-entry>}
 *    Designate the symbols of the generator.
 *    Symbols are sperated by a comma.
 *    The symbol to use is calculated by the generator value mod the number of symbols
 *    Examples:
 *      {%:a,b,c; 0,2,1}  => {a, c, b}
 *      {%:a,b,c; 1,4,-2} => {b, b, b}
 * 
 * [track=<track>;] [symbols=<symbols>;] (<value> | [<start=0>] : [<stop=0>] [: <step=1>]) [, ...]
 *    The full syntax of a generator.
 *    
 * @param {string} line A single line containing a generator 
 */
function parseLine(line) {
  
  console.log(line);

  // Skip if line does not contain a generator
  if (!line.includes('{')) {
    parseDelta(line);
    return;
  }

  //
  // Parse all generators
  //

  // Stack of indicies where '{' was encountered
  let indicies = [];
  
  // Set of tracks belonging to a generator not containing another generator
  let possibleTracks = new Set();

  // Set of tracks belonging to a generator containing another generator
  let invalidTracks = new Set();

  // Contains a stack of generators for each possible track
  // Only one stack will be used once a track is decided
  let trackGens = {};

  // Parse every character
  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    // A generator has been entered
    if (char == '{') {
      indicies.push(i)      
      
    // A generator has been exited
    } else if (char == '}') {

      const start = indicies.pop();  
      const end = i + 1;
      const generatorText = line.slice(start,end);
      const generator = parseGenerator(generatorText);
      const track = generator.track;

      if (generator.containsGenerator) {

        // Store generator track as an invalid track
        invalidTracks.add(generator.track);
      
      } else {

        // Store generator track as a possibly valid track
        possibleTracks.add(generator.track);

        // Add start and end indicies to generator
        // This cannot be calculated by the generator parser
        generator.start = start;
        generator.end = end;

        // Push generator object to it's track's stack 
        trackGens[track] ??= [];
        trackGens[track].push(generator);
      }
    }
  }

  //
  // Determine track to use
  //

  let track;
  
  // Find the first track that is valid and not invalid
  for (track of [...possibleTracks]) {
    if (!invalidTracks.has(track)) {
      break;
    }
  }  

  //
  // Fragment line
  //

  // The line split along the generators with the current track
  const segs = [line];

  // The generators for the current track in reversed order
  let generators = trackGens[track];

  // Deque generators and 
  for (let generator of generators.toReversed()) {
    const start = generator.start;
    const end = generator.end;
    const seg = segs.shift();
    const seg0 = seg.slice(0,start);
    const seg1 = seg.slice(end);
    segs.unshift(seg0,seg1);
  }

  //
  // Rebuild into multiple lines
  //

  // Number of new lines that will be generated
  const reps = generators[0].items.length;

  // Create a new line for each item in the generator
  for (let i = 0; i < reps; i++) {

    // The line with generators of the current track replaced
    let newLine = segs[0];
    
    // Repeat for each generator and segment
    for (let j = 0; j < generators.length; j++) {

      const generator = generators[j];

      // Replace generator with its symbol or value and push onto current line
      if ('symbols' in generator) {
        // Modulus without negatives
        const len = generator.symbols.length
        const index = ((generator.items[i] % len) + len) % len;
        newLine += generator.symbols[index];
      } else {
        newLine += generator.items[i];
      }

      // Push next segment onto the current line
      newLine += segs[j + 1];
    }

    
    
    // Parse the resulting line incase it also contains a generator
    parseLine(newLine);

  }
}





/**
 * 
 * @param {String} text The generator as as a string.
 * @returns An object representing a generator.
 */
function parseGenerator(text) {

  // Remove curly braces
  text = text.slice(1,-1);

  // Remove spaces
  text = text.replace(/\s+/,'');

  // The generator object to return
  let generator = {};

  // Calculate if the generator conatians another generator
  generator.containsGenerator = text.includes('{');

  // The generator is divided into parts by the semicolon
  let parts = text.split(';');

  // Parse into JSON
  for (let part of parts) {
    // Each part of a generator is divided into a tag and a body
    const match = part.match(/(?:(?<tag>[^,:\s\d]+):)?(?<body>.*)/).groups;
      
    // Default tag for entries
    match.tag ??= "items";

    let tag = match.tag;
    let body = match.body;

    // Tag name abbreviations
    switch (tag) {
      case '@': tag = "items"; break;
      case '&': tag = "track"; break;
      case '%': tag = "symbols"; break;
      case '?': tag = "store"; break;
      case '!': tag = "recall"; break;
    }

    // Only parse the track for generators containing sub generators
    if (generator.containsGenerator && tag != 'track') continue;

    // Assign parsed body to tag
    switch (tag) {
      case "symbols": case "items":
        generator[tag] = parseMixedArray(match.body); 
        break;
      default:
        generator[tag] = match.body; 
    }
  }

  if (generator.containsGenerator) {
    // Default track value is the length of it's entries if there is no sub generators
    generator.track ??= '_';
  } else {
    // Default track value is the length of it's entries
    generator.track ??= '_' + generator.items.length;
  }
  
  return generator;
}


/**
 * @param {String} text A string for an array that may contain ranges as elements
 * @returns An array
 */
function parseMixedArray(text) {
  let returnArray = [];
  let items = text.split(",");

  for (let item of items) {
    if (item.includes(":")) {
      returnArray = returnArray.concat(parseSlice(item));
    } else {
      returnArray.push(item);
    }
  }

  return returnArray;
}

/**
 * 
 * @param {String} text A string representation of a slice.
 * @returns an Array of integers generated from the slice.
 */
function parseSlice(text) {
  let returnArray = [];

  // Divide into subvalues for start, end, step
  // All subvalues are integers
  let values = text.split(":");
  let start = parseInt(values[0]);
  let end = parseInt(values[1]);

  if (isNaN(start)) {
    start = 0;
  }

  // Check of optional third element is included
  if (values.length == 3) {
    step = parseInt(values[2]);
  } else {
    step = 1;
  }

  // Reverse if iteration is negative
  // TODO optimize
  if (step > 0) {
    for (let k = start; k < end; k += step) {
      returnArray.push(k);
    }
  } else {
    for (let k = start; k > end; k += step) {
      returnArray.push(k);
    }
  }

  return returnArray;
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
 * @param {string} line A line describing a delta transition
 */
function parseDelta(line) {
  const args = line.split(/\s+/);

  // Calculate the number of dimensions as the largest dimension index value plus one
  for (let i = 4; i < args.length; i += 2) {
    const dim = parseInt(args[i]);
    if (dim + 1 > nDims) {
      nDims = dim + 1;
    }
  }

  deltas[[args[0], args[1]]] = args.slice(2);
}