/*
 * Code for everything relating to the TuringMachine++ display and interface except the code editor
 * dependent on script.js
 */

// Load a 2D slice of the TM++ onto the canvas
document.addEventListener("DOMContentLoaded", function() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
  
    // Initial grid properties
    let cellSize = 50; // Pixel buffer size
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
      const xMin = Math.round((0 - panX) / (cellSize * scale)) - offset;
      const xMax = Math.round((canvas.width - panX) / (cellSize * scale)) + offset;
      const yMin = Math.round((0 - panY) / (cellSize * scale)) - offset;
      const yMax = Math.round((canvas.height - panY) / (cellSize * scale)) + offset;

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
  
            // Position of cell
            const xPos = x * cellSize;
            const yPos = y * cellSize;
            const symbol = tape[cell]
            
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
  





    function handleWheel(event) {
      const zoomFactor = 0.1;
      const delta = event.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;
      const rect = canvas.getBoundingClientRect()
      const xPos = event.clientX - rect.left;
      const yPos = event.clientY - rect.top;
      // Focus zoom on the mouse
      panX = ( panX - xPos ) * delta + xPos;
      panY = ( panY - yPos ) * delta + yPos;
      scale *= delta;
      updateCoords(event);
      drawGrid();
    }
  
    function handleMousemove(event) {  
      if (event.buttons === 1) {
        panX += event.movementX;
        panY += event.movementY;
        drawGrid();
      }
      updateCoords(event);
    }

    function handleAuxclick(event) {
      if (event.button === 1) {
        panX = panY = 0;
        scale = 1;
        drawGrid();
      }
    }

    function handleResize(event) {
      canvas.width = canvas.getBoundingClientRect().width;
      canvas.height = canvas.getBoundingClientRect().height; 
      drawGrid();
    }

    function updateCoords(event) {
      const rect = canvas.getBoundingClientRect()
      const xPos = event.clientX - rect.left;
      const yPos = event.clientY - rect.top;
      const x = (xPos - panX) / cellSize / scale;
      const y = (yPos - panY) / cellSize / scale;
      document.getElementById("coords").innerHTML = '' + x + ', ' + y;
    }
    




    // Canvas does not have a native resize listener 
    new ResizeObserver(handleResize).observe(canvas)

    canvas.addEventListener('auxclick',handleAuxclick);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("mousemove", handleMousemove);
      
    parse(); // Initial parse
  
    drawGrid(); // Initial draw
  });
  