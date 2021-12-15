// These are our HTML elements
var canvas = document.getElementById('mainCanvas'),
    canvasContainer = document.getElementById('canvas-container'),
    users = document.querySelector('.users'),
    /*onButton = document.getElementById('onButton'),*/
    offButton = document.getElementById('offButton'),
    sendNoiseButton = document.getElementById('sendNoiseButton'),
    sendPictureButton = document.getElementById('sendPicture'),
    colorPicker = document.getElementById('colorPicker'),
    input = document.getElementById('input');

var websocket = new WebSocket("wss://smolroom.com:8001/");

// ########## Global Variables ##########
// The interval at which this script will ping the server for updates
var updateInterval;

// holds the pixel data displayed on the canvas
var picture;

// 3600 frame to buffer information for sending a frame to the server
var frameBuffer = new Array(3600);
frameBuffer.fill(0);

// larger array used to store multiple frames in a 2d array to be sent to the server
var videoCounter = 0;
var numVideoFrames;
var videoBuffer;

// how big to make each grid square on the canvas
var squareSize;

// the current color the user will draw with
var currentColorObject = hexToRgbObject(colorPicker.value);

// canvas drawing variables
var mouseIsDown = false;
let clickingX = 0;
let clickingY = 0;

// used for looping perlin noise
var noiseInterval;
var noise;

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

// hsv2rgb and rgb2hsv functions from @Adam Price on stack overflow
// requires 0<=h,s,v<=1
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// requires 0<=r,g,b<=255
// returns 0<=h,s,v<=1
function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

// ########## Core functions ##########
// Ensure the canvas is the correct size and draws what the light matrix looks like
function draw() {
    adjustDocumentHeight();
    adjustCanvasSize();

    ctx.fillStyle = "#888888";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var x = 0; x < 30; x++) {
        for (var y = 0; y < 30; y++) {
            var relativeIndex = (x * 30) + y;
            ctx.fillStyle = rgb(picture[(relativeIndex*4)], picture[(relativeIndex*4)+1], picture[(relativeIndex*4)+2]);
            ctx.fillRect(x*squareSize+1, y*squareSize+1, squareSize-2, squareSize-2);
        }
    }
}

// ########## Event Functions ##########
// Ran when image is selected
function handleImgSubmit(event) {
    var img = new Image;
    img.src = URL.createObjectURL(event.target.files[0]);
    img.onload = () => {
        // get aspect ratio of the chosen img
        var imgAspectRatio = img.naturalWidth/img.naturalHeight;
        // use the aspect ration to resize the img to fit the grid, these hold the adjusted size in pixels
        var adjustedImgWidth, adjustedImgHeight;

        // depending on which dimensino of the picture is bigest, fit the img on to the canvas
        if(img.naturalWidth >= img.naturalHeight) {
            adjustedImgWidth = canvas.width;
            adjustedImgHeight = Math.floor(canvas.width/imgAspectRatio);
        }else{
            adjustedImgWidth = canvas.height*imgAspectRatio;
            adjustedImgHeight = canvas.height;
        }
        
        // Draw img, After Image is drawn, grab the imageData
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, adjustedImgWidth, adjustedImgHeight);
        var imgData = ctx.getImageData(0, 0, adjustedImgWidth, adjustedImgHeight);

        // Variables used in the following for loop
        var pictureX, pictureY, matrixX, matrixY, singleDimMatrixIndex, counter;

        // For every value in the image data
        for (var i = 0; i < imgData.data.length; i += 4) {
            
            // Figure out the X Y coords of the value in the image
            pictureY = Math.floor(Math.floor(i/4)/imgData.width);
            pictureX = Math.floor(i/4)%imgData.width;

            // Figure out the X Y coords of the value in the matrix
            matrixX = Math.floor(pictureX/squareSize);
            matrixY = Math.floor(pictureY/squareSize);

            // Figure out the single dimensional index of the matrix location out of 3600
            singleDimMatrixIndex = (matrixX * 30 + matrixY) * 4;
            
            // for each red green blue color, add the color to the corresponding red green blue of the frame buffer
            for(var j = 0; j < 3; j ++) {
                frameBuffer[singleDimMatrixIndex + j] += imgData.data[i + j];
            }
            // as a counter we will then increment the unused white color spot
            frameBuffer[singleDimMatrixIndex + 3] ++;
        }

        // for every color in the frame buffer
        frameBuffer = frameBuffer.map((color, index) => {
            
            // if the index we are looking at is the white spot, return 0 as we want that color turned off
            if(index%4 == 3) {
                return 0;
            }
            
            // get the counter info from the white spot of the current pixel
            var divideBy = (frameBuffer[index-(index%4)+3]);
            // ensure we dont run into any divide by 0 errors
            if (divideBy == 0) return 0;

            // return the original colro info divided by the counter thus creating an average of all the colors added
            // using the Math functions ensures the value being returned is between 0 and 255
            return Math.min(255, Math.max(0, Math.floor(color / divideBy)));
        });
        
        // Further image processing goes here, this is currently unused
        /* This turns off any pixel that was probably supposed to be black but came out kinda grey
        for(var i = 0; i < frameBuffer.length; i += 4) {
            if ((frameBuffer[i] == frameBuffer[i + 1]) && (frameBuffer[i] == frameBuffer[i + 2]) && frameBuffer[i] < 25) {
                frameBuffer[i] = frameBuffer[i + 1] = frameBuffer[i + 2] = 0;
            }
        }*/
    };
}

// Window Events

//adjust window size
function adjustDocumentHeight() {
    // get the viewport height and we multiple it by 0.01 to get a value for a 1% vh unit
    let vh = window.innerHeight * 0.01;

    // set the value in the --vh custom property
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Adjust canvas size and calculate optimal square size
function adjustCanvasSize() {
    // Grab canvas div size
    var canvasContainerWidth = canvasContainer.offsetWidth;
    var canvasContainerHeight = canvasContainer.offsetHeight;

    // If canvas area width bigger than height
    if(canvasContainerWidth >= canvasContainerHeight) {
        canvas.height = canvasContainerHeight;
        canvas.width = canvasContainerHeight;
        squareSize = canvas.height/30;
    } else {
        canvas.height = canvasContainerWidth;
        canvas.width = canvasContainerWidth;
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
                websocket.send(JSON.stringify({
                    action: 'pixel', 
                    index: (gridX * 30) + gridY, 
                    color: [0, 0, 0, 0]
                })); 
            }else if(event.buttons == 1 || event.buttons == 0){
                websocket.send(JSON.stringify({
                    action: 'pixel', 
                    index: (gridX * 30) + gridY, 
                    color: [
                        currentColorObject.r, 
                        currentColorObject.g, 
                        currentColorObject.b, 
                        0
                    ]
                })); 
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

// Send frame in the buffer to the server
sendPictureButton.onclick = function (event) {
    //console.log(frameBuffer);
    websocket.send(JSON.stringify({action: 'frame', frame: frameBuffer}));
    frameBuffer.fill(0);
}

// send some noise until the button is clicked again
sendNoiseButton.onclick = function (event) {
    var firstOctave = 20;
    var thirdDim = 160;
    numVideoFrames = thirdDim + firstOctave;
    noise = new perlinNoise([30, 30, thirdDim], firstOctave, 3, 1/3);
    
    videoBuffer = new Array(numVideoFrames);
    
    for (let i = 0; i < videoBuffer.length; i++) {
        videoBuffer[i] = new Array(3600).fill(0);
    }
    
    //console.log(videoBuffer);

    for(var i = 0; i < numVideoFrames; i ++) {
        for(var x = 0; x < 30; x++) {
            for(var y = 0; y < 30; y++) {
                var noiseValue = map(noise.getNoisePixel([x, y, i]), -1, 1, 0, 1);

                var color = HSVtoRGB(noiseValue, 1, 0.5);

                videoBuffer[i][((x * 30 + y) * 4)] = color.r;
                videoBuffer[i][((x * 30 + y) * 4) + 1] = color.g;
                videoBuffer[i][((x * 30 + y) * 4) + 2] = color.b;
            }
        }
    }

    clearInterval(noiseInterval);
    videoCounter = 0;
    noiseInterval = setInterval(sendVideoFrame, 1000/24);
}

function sendVideoFrame() {
    if(videoCounter < numVideoFrames) {
        websocket.send(JSON.stringify({action: 'frame', frame: videoBuffer[videoCounter]}));
        videoCounter++;
    } else {
        videoCounter = 0;
    }
}

// Send the command to turn off all the lights
offButton.onclick = function (event) {
    websocket.send(JSON.stringify({action: 'allOff'}));
    clearInterval(noiseInterval);
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
        clientX: touch.pageX,
        clientY: touch.pageY
    });

    canvas.dispatchEvent(mouseEvent);
}, false);

// touch move
canvas.addEventListener("touchmove", event => {
    var touch = event.touches[0];
    
    //var clientX = touch.clientX + canvas.offsetLeft;
    //var clientY = touch.clientY;

    var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.pageX,
        clientY: touch.pageY
    });

    canvas.dispatchEvent(mouseEvent);
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
    try {
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
                console.error("unsupported event", data);
        }
    } catch (err) {
        console.log("Error occurred processing message:");
        console.log(event);
    }
};

function getPicture() {
    websocket.send(JSON.stringify({"action": "getPicture"}));
}

function main() {
    updateInterval = setInterval(getPicture, 1000/24);
}

main();
