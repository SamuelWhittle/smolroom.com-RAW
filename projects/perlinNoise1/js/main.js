// Document Elements
let mainCanvas = document.getElementById('mainCanvas');

// Drawing Context
let ctx = mainCanvas.getContext('2d');

// Global Variables

// Event Listeners
window.addEventListener('load', () => {
    adjustCanvasSize();
    startInterval();
});

window.addEventListener('resize', () => {
    adjustCanvasSize();
    startInterval();
});

// Custom Functions
function startInterval() {
    ctx.strokeStyle = '#FFa000';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(mainCanvas.width, mainCanvas.height);
    ctx.stroke();
}

function adjustCanvasSize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}
