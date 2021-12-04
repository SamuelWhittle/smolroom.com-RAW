// Document Elements
let mainCanvas = document.querySelector('.main-canvas');

// Drawing Context
let ctx = mainCanvas.getContext('2d');

// Global Variables
let triangle = new Array(3).fill(new Array(2).fill(0));

let mouseDown = false;

// Event Listeners
window.addEventListener('load', updateCanvas);
window.addEventListener('resize', updateCanvas);

mainCanvas.addEventListener('mousedown', () => {
    mouseDown = true;
});

mainCanvas.addEventListener('mouseup', () => {
    mouseDown = false;
});

// Functions
function adjustCanvasSize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}

function updateCanvas() {
    // Make sure canvas resolution matches window inner resolution
    adjustCanvasSize();

    drawTriangle(triangle);
}

function drawTriangle(triToDraw) {
    triToDraw.map((point) => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI)
        ctx.fill();
    });

    ctx.beginPath();
    ctx.moveTo(triToDraw[0][0], triToDraw[0][1]);
    ctx.lineTo(triToDraw[1][0], triToDraw[1][1]);
    ctx.lineTo(triToDraw[2][0], triToDraw[2][1]);
    ctx.lineTo(triToDraw[0][0], triToDraw[0][1]);
    ctx.stroke();
}

// Do Stuff
triangle[0] = [100, 100];
triangle[1] = [200, 150];
triangle[2] = [150, 200];
