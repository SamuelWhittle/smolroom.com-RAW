// These are our HTML elements
var canvas = document.getElementById('mainCanvas'),
    canvasSlot = document.getElementById('canvasSlot'),
    users = document.querySelector('.users'),
    /*onButton = document.getElementById('onButton'),*/
    offButton = document.getElementById('offButton'),
    colorPicker = document.getElementById('colorPicker'),
    input = document.getElementById('input'),
    websocket = new WebSocket("wss://smolroom.com:8001/");

// ########## Global Variables ##########
var picture;
var squareSize;
var currentColorObject = {
    r: 255,
    g: 128,
    b: 0
};

var mouseIsDown = false;

// Canvas Context for drawing
var ctx = canvas.getContext("2d");



// ########## Color Helper Functions ##########

// Converts {r : 0, g : 0, b : 0} to "rgb(0, 0, 0)"
function rgbObjectToCssRgb(colorObject) {
    return `rgb(${colorObject.r}, ${colorObject.g}, ${colorObject.b})`
}

// Covnerts #000000 to {r : 0, g : 0, b : 0}
function hexToRgbObject(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Convert 3 values (r, g, b) into "rgb(r, g, b)" where r g and b are all integers between 0 and 255
const rgb = (r, g, b) => 
  `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;

function sendToServer(payload) {
    websocket.send(payload);
}



// ########## Core functions ##########

// Ensure the canvas is the correct size and draws what the light matrix looks like
function draw() {
    adjustCanvasSize();

    ctx.fillStyle = "#888888";
    ctx.fillRect(0, 0, squareSize*30, squareSize*30);

    for (var x = 0; x < 30; x++) {
        for (var y = 0; y < 30; y++) {
            var relativeIndex = (x * 30) + y;
            ctx.fillStyle = rgb(picture[(relativeIndex*4)], picture[(relativeIndex*4)+1], picture[(relativeIndex*4)+2]);
            ctx.fillRect(x*squareSize+1, y*squareSize+1, squareSize-2, squareSize-2);
        }
    }
}



// ########## Event Functions ##########

// LogFile
function logFile(event) {
    let result = event.target.result;

    var img = new Image;

    img.src = result;

	let secondCanvas = document.createElement('canvas');
    secondCtx = secondCanvas.getContext('2d');
	secondCtx.drawImage(img, 0, 0);
	console.log(result);
}

// Ran when image is selected
function handleImgSubmit(event) {
    var img = new Image;
    img.src = URL.createObjectURL(event.target.files[0]);
    img.onload = () => {
        console.log(img);
        ctx.drawImage(img, 0, 0);
    };
}

// Window Events

// Adjust canvas size and calculate optimal square size
function adjustCanvasSize() {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;

    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    var canvasSlotWidth = canvasSlot.offsetWidth;
    var canvasSlotHeight = canvasSlot.offsetHeight;

    if(canvasSlotWidth >= canvasSlotHeight) {
        canvas.height = canvasSlotHeight;
        canvas.width = canvasSlotHeight;
        squareSize = canvas.height/30;
    } else {
        canvas.height = canvasSlotWidth;
        canvas.width = canvasSlotWidth;
        squareSize = canvas.width/30;
    }
}

// Canvas Events

// get mouse location and change colors accordingly
function canvasDrag(event) {
    var imageData = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data;
    // if the currently selected color is different than the current pixel color
    if(!(imageData[0] == currentColorObject.r && imageData[1] == currentColorObject.g && imageData[2] == currentColorObject.b)) {
        var gridX = Math.floor(event.offsetX/squareSize);
        var gridY = Math.floor(event.offsetY/squareSize);
        //console.log(gridX, gridY)

        if(gridX <= 29 && gridY <= 29) {
            if(event.buttons == 2) {
                event.preventDefault();
                sendToServer(JSON.stringify({action: 'pixel', index: (gridX * 30) + gridY, color: [0, 0, 0, 0]})); 
            }else if(event.buttons == 1 || event.buttons == 0){
                sendToServer(JSON.stringify({action: 'pixel', index: (gridX * 30) + gridY, color: [currentColorObject.r, currentColorObject.g, currentColorObject.b, 0]})); 
            }
        }
    }
}

// Color Picker Events

// Save the color from the picker as the global color object
function colorPickerNewColor(event) {
    currentColorObject = hexToRgbObject(event.target.value);
}

// Unused, runs when the color picker is dismissed
function colorPickerDismiss() {
    console.log("colorPicker dismiss");
}



// ########## Event Listeners ##########

// Listen for an image being selected
input.addEventListener('change', handleImgSubmit);

// Send the command to turn off all the lights
offButton.onclick = function (event) {
    websocket.send(JSON.stringify({action: 'allOff'}));
}

// canvas right click
canvas.addEventListener('contextmenu', event => {
    event.preventDefault();
});

// mouse down
canvas.addEventListener('mousedown', event => {
    mouseIsDown = true;
    canvasDrag(event);
});

// mouse move
canvas.addEventListener('mousemove', event => {
    if (mouseIsDown) {
        canvasDrag(event);
    }
});

// mouse up
window.addEventListener('mouseup', event => {
    mouseIsDown = false;
});

// touch start
canvas.addEventListener('touchstart', event => {
    var touch = event.touches[0];
    var mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });

    canvas.dispatchEvent(mouseEvent);
}, false);

// touch move
canvas.addEventListener("touchmove", event => {
    var touch = event.touches[0];
    
    var clientX = touch.clientX;
    var clientY = touch.clientY;

    if(clientX >= 0 && clientX <= squareSize*30 && clientY >= 0 && clientY <= squareSize*30) {
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: clientX,
            clientY: clientY
        });

        canvas.dispatchEvent(mouseEvent);
    }
}, false);

// touch end
window.addEventListener("touchend", event => {
    var mouseEvent = new MouseEvent("mouseup", {});
    window.dispatchEvent(mouseEvent);
}, false);

// When the window is resized
window.addEventListener('resize', draw);

// When the color picker is interacted with
colorPicker.addEventListener("input", colorPickerNewColor, false);
colorPicker.addEventListener("change", colorPickerDismiss, false);



// Process received websocket data
websocket.onmessage = function (event) {
    data = JSON.parse(event.data);
    switch (data.type) {
        case 'state':
            //console.log(data);
            picture = data.picture;
            draw();
            break;
        case 'users':
            users.textContent = (
                data.count.toString() + " user" +
                (data.count == 1 ? "" : "s"));
            break;
        default:
            console.error(
                "unsupported event", data);
    }
};
