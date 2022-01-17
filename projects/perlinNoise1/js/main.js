// Document Elements
let mainCanvas = document.getElementById('mainCanvas');

// Drawing Context
let ctx = mainCanvas.getContext('2d');

// Global Variables
let counter = 0;

let canvasDivisor = 50;

let dims = new Array(2);

let angleNoise;
let colorNoise;
let intensityNoise;

// Event Listeners
window.addEventListener('load', () => {
    adjustCanvasSize();
    calculateConstants();
    setInterval(drawLines, 1000/24);
    //drawLines();
});

window.addEventListener('resize', () => {
    adjustCanvasSize();
    //startInterval();
});

// Custom Functions
function drawLines() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    for(let x = 0; x < dims[0]; x ++) {
        for(let y = 0; y < dims[1]; y ++) {
            // All noise values will start between -1 and 1

            // Get angle noise value and adjust contraints from -1 to 0 and from 1 to Math.PI*2
            let angle = angleNoise.getNoisePixel([x, y, counter]);
            angle = map(angle, -1, 1, 0, Math.PI*2);

            // Get color noise value and adjust contraints from -1 to 150 and from 1 to 250
            let color = colorNoise.getNoisePixel([x, y, counter]);
            color = map(color, -1, 1, 150, 250);

            // Get intensity noise value
            let intensity = intensityNoise.getNoisePixel([x, y, counter]);
            // adjust intensity contraints from -1 to 0 and from 1 to 10, this is for line width
            let lineWidth = Math.floor(map(intensity, -1, 1, 0, 10));
            // adjust intensity contraints from -1 to 0 and from 1 to 150, this is for line length
            let length = Math.floor(map(intensity, -1, 1, 0, 150));
            // adjust intensity contraints from -1 to 0 and from 1 to 1, this is for line opacity
            let opacity = map(intensity, -1, 1, 0, 1);

            // set line width and color
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = `hsla(${color}, 100%, 50%, ${opacity})`

            // calculate the endpoint of the line
            let lineEndX = x * canvasDivisor + Math.cos(angle) * length;
            let lineEndY = y * canvasDivisor + Math.sin(angle) * length;

            // Draw the inital line
            ctx.beginPath();
            ctx.moveTo(x * canvasDivisor, y * canvasDivisor);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.stroke();

            // Set accent color
            ctx.fillStyle = `hsla(${color}, 100%, 100%, ${opacity})`
            // Draw accent
            ctx.beginPath();
            ctx.arc(lineEndX, lineEndY, lineWidth/2, 0, Math.PI*2);
            ctx.fill();
        }
    }

    counter += 0.16;

    counter = counter%1001;
}

function calculateConstants() {
    dims[0] = Math.ceil(mainCanvas.width / canvasDivisor) + 1;
    dims[1] = Math.ceil(mainCanvas.height / canvasDivisor) + 1;
    angleNoise = new perlinNoise([dims[0], dims[1], 1000], 10, 2, 1/2);
    colorNoise = new perlinNoise([dims[0], dims[1], 1000], 20, 2, 1/2);
    intensityNoise = new perlinNoise([dims[0], dims[1], 1000], 10, 2, 1/2);
}

function adjustCanvasSize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}
