// Resize the canvas
function cSize(w, h) {
	c.width = w;
	c.height = h;
}

// changes the color of the body background to match user selection
function updateColors() {
	document.body.style.backgroundColor = 'rgb(' + redInput.value + ', ' + greenInput.value + ', ' + blueInput.value + ')';
    desaturationScale.setOriginalColor(new Color(redInput.value, greenInput.value, blueInput.value));
    drawDesaturationScale();
}

// draw desaturation on the canvas
function drawDesaturationScale() {
    desaturationScale.colorArray.forEach((column, widthIndex) => {
        column.forEach((color, heightIndex) => {
            ctx.fillStyle = color.getRGBString();
            ctx.fillRect(widthIndex*gridThickness, heightIndex*gridThickness, (widthIndex+1)*gridThickness, (heightIndex+1)*gridThickness);
        })
    });
}

//////////////////////////////////////////////////

// Get canvas refs
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

// Get slider refs
var redInput = document.getElementById('redInput');
var greenInput = document.getElementById('greenInput');
var blueInput = document.getElementById('blueInput');

//////////////////////////////////////////////////

// Set Canvas Size
var gridWidth = 13;
var gridHeight = 23;
var gridThickness = 20;
cSize(gridWidth * gridThickness, gridHeight * gridThickness);

// Create desaturation scale object
var desaturationScale = new DesaturationScale(new Color(redInput.value, greenInput.value, blueInput.value), gridWidth, gridHeight);

// create Color from refs and draw it on the canvas
var color = new Color(redInput.value, greenInput.value, blueInput.value);

// On window load run update function
window.onload = () => {
    updateColors();
};

// Add change event listeners to the input sliders
redInput.addEventListener('input', function() {
	color.rgb[0] = redInput.value;
	updateColors();
}, false);

greenInput.addEventListener('input', function() {
	color.rgb[1] = greenInput.value;
	updateColors();
}, false);

blueInput.addEventListener('input', function() {
	color.rgb[2] = blueInput.value;
	updateColors();
}, false);
