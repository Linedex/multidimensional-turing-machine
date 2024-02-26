/*
 * Code for everything relating to the TuringMachine++ display and interface except the code editor
 * dependent on script.js
 */

// Initial grid properties
let panX = 0;
let panY = 0;
let scale = 100;



// Load a 2D slice of the TM++ onto the canvas
document.addEventListener("DOMContentLoaded", function() {

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  function handleWheel(event) {
    if (event.shiftKey) {
      // Scroll through Z
      if (zIndex >= 0) {
        viewCoords[zIndex] -= Math.sign(event.deltaY);
      }
    } else {
      // Zoom with focal point on the mouse
      const zoomFactor = 0.1;
      const delta = event.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;
      changeZoom(delta, event.clientX, event.clientY);
    }
    updateCoords(event);
    draw();
  }
  
  function handleMousemove(event) {
    if (event.buttons === 1) {
      panX += event.movementX;
      panY += event.movementY;
      draw();
    }
    updateCoords(event);
  }
  
  function handleAuxclick(event) {
    if (event.button === 1) {
      // Refocus to tape bounds
      autoFocusTape();
      draw();
    }
  }
  
  function handleResize(event) {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    draw();
  }
  
  function updateCoords(event) {
    const rect = canvas.getBoundingClientRect()
    const xPos = event.clientX - rect.left;
    const yPos = event.clientY - rect.top;
    const x = Math.floor((xPos - panX) / scale);
    const y = Math.floor((yPos - panY) / scale);
    // const s = scale.toExponential(2)
    const s = scale.toPrecision(3);
    coords = [...viewCoords] 
    coords[xIndex] = x;
    coords[yIndex] = y;
    document.getElementById("coords").innerHTML = s + 'x (' + coords + ')';
    // document.getElementById("coords").innerHTML = s + 'x (' + x + ', ' + y + ')';
  }

  // Canvas does not have a native resize listener 
  new ResizeObserver(handleResize).observe(canvas)

  canvas.addEventListener('auxclick', handleAuxclick);
  canvas.addEventListener("wheel", handleWheel);
  canvas.addEventListener("mousemove", handleMousemove);

  parseMachine(); // Initial parse
  runMachine();
  autoFocusTape();
  draw(); // Initial draw
});



/**
 * The main function that draws the entire view
 */
function draw() {

  // Reset canvas
  ctx.setTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = Math.min(0.01, 1 / scale); // Prevent lineweight from scaling unless zoomed far out 
  ctx.setTransform(scale, 0, 0, scale, panX, panY); // Scale to current view

  // Extra cells to display outside of viewport
  const offset = 1;

  // Calculate the boundaries of the tape's viewport  
  var xMin = Math.round(-panX / scale) - offset;
  var xMax = Math.round((canvas.width - panX) / scale) + offset;
  var yMin = Math.round(-panY / scale) - offset;
  var yMax = Math.round((canvas.height - panY) / scale) + offset;

  // Draw gridlines
  if (showGrid && scale > 5) {
    // Draw vertical gridlines
    for (let x = xMin; x <= xMax; x++) {
      ctx.beginPath();
      ctx.moveTo(x, yMin);
      ctx.lineTo(x, yMax);
      ctx.stroke();
    }
    // Draw horizontal gridlines
    for (let y = yMin; y <= yMax; y++) {
      ctx.beginPath();
      ctx.moveTo(xMin, y);
      ctx.lineTo(xMax, y);
      ctx.stroke();
    }
  }

  // Shrink bounds if they excede tape bounds
  xMin = Math.max(xMin, tapeBoundsMin[xIndex]);
  yMin = Math.max(yMin, tapeBoundsMin[yIndex]);
  xMax = Math.min(xMax, tapeBoundsMax[xIndex]);
  yMax = Math.min(yMax, tapeBoundsMax[yIndex]);

  // Copy the viewCoords as the cell pointer
  var cell = [...viewCoords]

  // Draw all cells in the viewport
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {

      // Only iterate over two dimensions and keep the other dimensions unchanges
      cell[xIndex] = x;
      cell[yIndex] = y;

      // Draw cell's symbol
      if (cell in tape) {

        const symbol = tape[cell]

        // Fill in symbol color
        if (symbol in colors) {
          ctx.fillStyle = colors[symbol];
          ctx.fillRect(x, y, 1, 1);
        } else {
          ctx.textAlign = "center";
          ctx.fillStyle = '#abb2bf';
          ctx.textBaseline = "middle";
          ctx.font = ".5px monospace";
          ctx.fillText(symbol, x + 0.5, y + 0.5);
        }
      }
    }
  }

  // Check that all non x and y coords are identical in both the head and viewCoords
  if (viewCoords.every((x,i)=>x==head[i])) {
    // Draw head
    const x = head[xIndex];
    const y = head[yIndex];
    ctx.lineWidth = 2 * Math.min(scale, 1 / scale); // Prevent lineweight from scaling unless zoomed far out 
    ctx.strokeStyle = "red";
    ctx.strokeRect(x, y, 1, 1);
  }
}



/**
 * Automatically focus on the tape
 */
function autoFocusTape() {
  const rect = canvas.getBoundingClientRect()
  const xMin = tapeBoundsMin[xIndex] - 1;
  const yMin = tapeBoundsMin[yIndex] - 1;
  const xMax = tapeBoundsMax[xIndex] + 2; // FIXME this should be a 1
  const yMax = tapeBoundsMax[yIndex] + 2;
  scale = Math.min(rect.width / (xMax - xMin), rect.height / (yMax - yMin))
  panX = (rect.width - (xMin + xMax) * scale) / 2;
  panY = (rect.height - (yMin + yMax) * scale) / 2;
}



/**
 * Change the zoom of the canvas
 * 
 * @param {Number} delta The factor in which the scale is multiplied by
 * @param {Number} x The x coord of the focal point
 * @param {Number} y The y coord of the focal point 
 */
function changeZoom(delta,x,y) {
  const rect = canvas.getBoundingClientRect();
  const xPos = x - rect.left;
  const yPos = y - rect.top;
  // Focus zoom on focal point
  panX = (panX - xPos) * delta + xPos;
  panY = (panY - yPos) * delta + yPos;
  scale *= delta;
}