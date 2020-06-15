// Resize the canvas
function cSize(w, h) {
	c.width = w;
	c.height = h;
}

// changes the color of the body background to match user selection
function updateBodyColor() {
	document.body.style.backgroundColor = 'rgb(' + color.rgb[0] + ', ' + color.rgb[1] + ', ' + color.rgb[2] + ')';
    document.getElementById("desaturateButton").style.background = color.getNegative().getRGBString();
}

// draw desaturation on the canvas
function drawDesaturationScale(desaturationScale) {
    desaturationScale.colorArray.forEach((column, widthIndex) => {
        column.forEach((color, heightIndex) => {
            ctx.fillStyle = color.getRGBString();
            ctx.fillRect(widthIndex*gridThickness, heightIndex*gridThickness, (widthIndex+1)*gridThickness, (heightIndex+1)*gridThickness);
        })
    });
}

// When the button is clicked
function desaturate() {
    var desaturationScale = new DesaturationScale(color, gridWidth, gridHeight);

    drawDesaturationScale(desaturationScale);
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

// create Color from refs and draw it on the canvas
var color = new Color(redInput.value, greenInput.value, blueInput.value);
updateBodyColor(color);

// Add change event listeners to the input sliders
redInput.addEventListener('input', function() {
	color.rgb[0] = redInput.value;
	updateBodyColor();
}, false);

greenInput.addEventListener('input', function() {
	color.rgb[1] = greenInput.value;
	updateBodyColor();
}, false);

blueInput.addEventListener('input', function() {
	color.rgb[2] = blueInput.value;
	updateBodyColor();
}, false);
