//-----------Functions-----------
var noise;

var scale = 20;

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
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
}

// draw the current point in time on the canvas
function draw() {
    // Make sure the canvas is the right size in pixels to match the parent div in the html
    adjustCanvasSize();

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);

     for(var x = 0; x < c.width; x+=scale) {
         for(var y = 0; y < c.height; y+=scale) {
            color = noise.getNoisePixel([x,y, timelineInput.value]);
            r = g = b = map(color, -1, 1, 0, 255);
            ctx.fillStyle = `rgb( ${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, scale, scale);
            //console.log(x, y);
         }
     }
}

// Where the things happen
function main() {
    // Make sure canvas is the right size
    adjustCanvasSize();
    
    // perlinNoise([dim1, dim2, dim3, ..., dimN(in pixels), gridStep, numOctaves, octaveScale])
    noise = new perlinNoise([c.width, c.height, timelineInput.max], 200, 4, 1/3, smoothInterp);
    console.log("Ready...");
    
    draw();
}

//----------HTML Elements-----------
// Get Canvas
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

// Get Input Slider
var timelineInput = document.getElementById("timeline");

//----------Event Listeners-----------
// Window Resize
window.addEventListener('resize', draw);

// Timeline move
timelineInput.addEventListener('input', draw);

//----------Do The Things-----------
main();