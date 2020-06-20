//----------- functions
// Sets canvas size to be relative to the chrome window
function adjustCanvasSize() {
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
}

// Where the drawing happens
function draw() {
    // Make sure the canvas is the right size in pixels to match the parent div in the html
    adjustCanvasSize();

    ctx.fillStyle = "#FF0000";
    ctx.fillRect(10, 10, 50, 50);
}

function redrawTime() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = "red";
    ctx.fillRect(timeline.value, 10, 50, 50);
}

// Where everything including calculations happens
function main() {
    draw();
}

//---------- HTML Elements
// Get Canvas
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

// Get Input Slider
var timelineInput = document.getElementById("timeline");

//---------- Event Listeners
// Window Resize
window.addEventListener('resize', draw);

// Timeline move
timelineInput.addEventListener('input', redrawTime);

//---------- Do The Things
main();