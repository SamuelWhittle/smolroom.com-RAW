//-----------Functions-----------
var noise;

var scale = 25;

function smoothInterp(a, b, c){
    c = smoothstep2(c);
    return a*(1-c)+b*c;
}

//Smoothstep function that assumed a safe value is passed (saves small amount of processing power)
function smoothstep2(x){
return x*x*(3-2*x);
}

//Transform a number from one range to another range
function map(num, oldMin, oldMax, min, max){
    return (num-oldMin)/(oldMax-oldMin)*(max-min)+min;
}

// Sets canvas size to be relative to the chrome window
function adjustCanvasSize() {
    c.width = canvasContainer.offsetWidth;
    c.height = canvasContainer.offsetHeight;
}

// draw the current point in time on the canvas
function draw() {
    // Make sure the canvas is the right size in pixels to match the parent div in the html
    adjustCanvasSize();
    adjustDocumentSize();

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);

     for(var x = 0; x < c.width; x+=scale) {
         for(var y = 0; y < c.height; y+=scale) {
            color = noise.getNoisePixel([x,y, Number(timelineInput.value)]);
            r = g = b = map(color, -1, 1, 0, 255);
            ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, scale, scale);
         }
     }
}

// Where the things happen
function main() {
    // Make sure canvas is the right size
    adjustCanvasSize();
    
    // perlinNoise([dim1, dim2, dim3, ..., dimN(in pixels)], gridStep, numOctaves, octaveScale])
    noise = new perlinNoise([c.width, c.height, 1000], 100, 3, 1/3);
    
    draw();
}

//----------HTML Elements-----------
// Get Canvas
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

// Get Canvas Container
var canvasContainer = document.querySelector('.canvasContainer');

// Get Inputs
var timelineInput = document.getElementById("timeline");
var resolution = document.getElementById("resolution");

var redrawInput = document.getElementById("redraw");

//----------Event Listeners-----------
// Window Load
//window.addEventListener('load', adjustDocumentSize);
// Window Resize
window.addEventListener('resize', draw);

// Timeline move
timelineInput.addEventListener('input', draw);

// Age change
redrawInput.addEventListener('click', () => {
    scale = Number(resolution.value);
    noise = new perlinNoise([c.width, c.height, 1000], 100, 3, 1/3);
    draw();
});

// Change Resolution
resolution.addEventListener('input', () => {
    scale = Number(resolution.value);
    draw();
});

//----------Do The Things-----------
main();
