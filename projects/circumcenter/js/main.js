// Document Elements
let mainCanvas = document.querySelector('.main-canvas');

// Drawing Context
let ctx = mainCanvas.getContext('2d');

// Global Variables
let triangle = new Array(3).fill(new Array(2).fill(0));
let bisectPoints = new Array(3).fill(new Array(2).fill(0));
let b = new Array(3).fill(0);
let slopes = new Array(3).fill(0);
let perpSlopes = new Array(3).fill(0);

let mouseDown = false;

let pointInHand = 0;

// Event Listeners
window.addEventListener('load', updateCanvas);
window.addEventListener('resize', updateCanvas);

mainCanvas.addEventListener('mousedown', (event) => {
    mouseDown = true;
    pickUpPoint(event);
    updateTriangle(event);
    updateCanvas();
});

window.addEventListener('mouseup', () => {
    mouseDown = false;
});

mainCanvas.addEventListener('mousemove', (event) => {
    if(mouseDown) {
        updateTriangle(event);
        updateCanvas();
    }
});

// Functions
function updateCanvas() {
    // Make sure canvas resolution matches window inner resolution
    adjustCanvasSize();

    // Draw the thing
    drawCircumcenter(triangle);
}

function adjustCanvasSize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}

function drawCircumcenter(triToDraw) {
    // Draw the Points
    triToDraw.map((point) => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI)
        ctx.fill();
    });

    // Draw the triangle
    ctx.beginPath();
    ctx.moveTo(triToDraw[0][0], triToDraw[0][1]);
    ctx.lineTo(triToDraw[1][0], triToDraw[1][1]);
    ctx.lineTo(triToDraw[2][0], triToDraw[2][1]);
    ctx.lineTo(triToDraw[0][0], triToDraw[0][1]);
    ctx.stroke();

    // Draw the bisecting perpendicular lines
    // Get Slopes of triangle sides
    slopes[0] = -1 * (triangle[1][1] - triangle[0][1]) / (triangle[1][0] - triangle[0][0]);
    slopes[1] = -1 * (triangle[2][1] - triangle[1][1]) / (triangle[2][0] - triangle[1][0]);
    slopes[2] = -1 * (triangle[0][1] - triangle[2][1]) / (triangle[0][0] - triangle[2][0]);

    // Get bisect points of triangle sides
    bisectPoints = triangle.map((point, pointIndex) => {
        let deltaX, deltaY;
        if(pointIndex < triangle.length - 1) {
            deltaX = triangle[pointIndex + 1][0] - triangle[pointIndex][0];
            deltaY = triangle[pointIndex + 1][1] - triangle[pointIndex][1];
        } else {
            deltaX = triangle[0][0] - triangle[pointIndex][0];
            deltaY = triangle[0][1] - triangle[pointIndex][1];
        }

        return [triangle[pointIndex][0] + deltaX / 2, triangle[pointIndex][1] + deltaY / 2];
    });

    // Draw perpendicular lines that bisect the triangle sides
    bisectPoints.map((bisectPoint, bPIndex) => {
        drawNormalLine(bisectPoint[0], bisectPoint[1], slopes[bPIndex]);
    });
}

function drawNormalLine(x, y, m) {
    // y-y1=m(x-x1)
    // y = m(x-x1)+y1
    ctx.beginPath();
    if(m != 0 && isFinite(m)) {
        const f = (x1) => (-1/m)*(x-x1)+y;
        ctx.moveTo(0, f(0));
        ctx.lineTo(mainCanvas.width, f(mainCanvas.width));
    } else if(m == 0 || m == -0) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mainCanvas.height);
    } else {
        ctx.moveTo(0, y);
        ctx.lineTo(mainCanvas.width, y);
    }
    ctx.stroke();
}

function pickUpPoint(event) {
    // Get mouse position
    let mouseX = event.clientX;
    let mouseY = event.clientY;

    // create array of distances from mouse to point
    let distances = triangle.map((point) => {
        return getDistance(mouseX, mouseY, point[0], point[1]);
    });
    
    // get the smallest of the distances
    let smallestDistance = Math.min(...distances);

    // get the distances[] index of the smallest index
    pointInHand = distances.indexOf(smallestDistance);
}

function updateTriangle(event) {
    triangle[pointInHand][0] = event.clientX;
    triangle[pointInHand][1] = event.clientY;
}

function getDistance(x, y, x1, y1) {
    return Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
}

// Setup
triangle[0] = [300, 300];
triangle[1] = [600, 300];
triangle[2] = [450, 600];
