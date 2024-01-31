/*
 * Code for everything relating to the TuringMachine++ display and interface except the code editor
 * dependent on script.js
 */

// Load a 2D slice of the TM++ onto the canvas
document.addEventListener("DOMContentLoaded", function() {

    var resize = document.querySelector("#resize");
    var left = document.querySelector("#editor-container")
    var container = document.querySelector("#body-container");
    var moveX = left.getBoundingClientRect().width + resize.getBoundingClientRect().width / 2;
    
    var drag = false;
    resize.addEventListener("mousedown", function (e) {
       drag = true;
       moveX = e.x;
    });
    
    container.addEventListener("mousemove", function (e) {
       moveX = e.x;
       if (drag)
          left.style.width =
             moveX - resize.getBoundingClientRect().width / 2 + "px";
    });
    
    container.addEventListener("mouseup", function (e) {
       drag = false;
    });
  
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
  
      // Copy the head as the cell pointer
      var cell = [...head]
  
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
  