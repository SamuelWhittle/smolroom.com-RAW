// Document Elements
let mainCanvas = document.querySelector('.main-canvas');

// Drawing Context
let ctx = mainCanvas.getContext('2d');

// Global Variables

ctx.strokeStyle = '#FFFFFF';

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
    if(event.buttons == 1) {
        mouseDown = true;
        pickUpPoint(event);
        updateTriangle(event);
        updateCanvas();
    }
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
    ctx.fillStyle = '#16161d';
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    ctx.fillStyle = '#FFFFFF';

    // Draw the thing
    drawCircumcenter(triangle);
}

function adjustCanvasSize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}

function drawCircumcenter(triToDraw) {
    ctx.strokeStyle = '#FFFFFF';
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
    slopes[0] = (triangle[1][1] - triangle[0][1]) / (triangle[1][0] - triangle[0][0]);
    slopes[1] = (triangle[2][1] - triangle[1][1]) / (triangle[2][0] - triangle[1][0]);
    slopes[2] = (triangle[0][1] - triangle[2][1]) / (triangle[0][0] - triangle[2][0]);

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



    // Draw the circle x, x1, y1, m, x2, x3, y3, m2
    let circumcenter = getCircumcenterPoint(bisectPoints[0][0], bisectPoints[0][1], -1/slopes[0],
                                        bisectPoints[1][0], bisectPoints[1][1], -1/slopes[1], 
                                        bisectPoints[2][0], bisectPoints[2][1], -1/slopes[2]);
    ctx.beginPath();
    ctx.arc(circumcenter[0], circumcenter[1], getDistance(circumcenter[0], circumcenter[1], triangle[0][0], triangle[0][1]), 0, 2*Math.PI)
    ctx.stroke();
}

function drawNormalLine(x, y, m) {
    // y-y1=m(x-x1)
    // y = m(x-x1)+y1
    ctx.beginPath();
    if(m != 0 && isFinite(m)) {
        //const f = (x1) => (-1/m)*(x-x1)+y;
        ctx.moveTo(0, getYOnPointSlope(x, y, -1/m, 0));
        ctx.lineTo(mainCanvas.width, getYOnPointSlope(x, y, -1/m, mainCanvas.width));
    } else if(m == 0 || m == -0) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mainCanvas.height);
    } else {
        ctx.moveTo(0, y);
        ctx.lineTo(mainCanvas.width, y);
    }
    ctx.stroke();
}

function getYOnPointSlope(x, y, m, x1) {
    return y-m*(x-x1);
}

function getXOnPointSlope(x, y, m, y1) {
    return x-(y-y1)/m;
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

function getCircumcenterPoint(x1, y1, m1, x2, y2, m2, x3, y3, m3) {
    // y=m(x - x1) + y1
    // y2=m(x2 - x3) + y3
    // assume y = y2 and return x

    if(isFinite(m1) && isFinite(m2)) {    
        return getInterceptPoint(x1, y1, m1, x2, y2, m2);
    } else if(!isFinite(m1)){
        return getInterceptPoint(x2, y2, m2, x3, y3, m3);
    }
    return getInterceptPoint(x1, y1, m1, x3, y3, m3);
}

function getInterceptPoint(x1, y1, m1, x2, y2, m2) { 
    let interceptX = ((m1*x1)-(m2*x2)-y1+y2)/(m1-m2);
    return [interceptX, m1 * (interceptX-x1) + y1];
}

// Setup
triangle[0] = [300, 300];
triangle[1] = [600, 300];
triangle[2] = [450, 600];
