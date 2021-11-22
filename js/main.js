// ########## Globals ##########
let lastMouseCoords = new Array(2).fill(0);

// ########## HTML DOM Elements ##########
let html = document.documentElement;
let body = document.body;
let backgroundCanvas = document.getElementById("backgroundCanvas");
const primaryNav = document.querySelector('.primary-navigation');
const navToggle = document.querySelector('.mobile-nav-toggle');

// ########## DOM Helpers ##########
let ctx = backgroundCanvas.getContext('2d');

// ########## Event Listeners ##########
navToggle.addEventListener('click', () => {
    const visibility = primaryNav.getAttribute('data-visible');

    if (visibility === "false") {
        primaryNav.setAttribute('data-visible', "true");
        navToggle.setAttribute('aria-expanded', "true");
    } else {
        primaryNav.setAttribute('data-visible', "false");
        navToggle.setAttribute('aria-expanded', "false");
    }
});

window.addEventListener('load', () => {
    // Solving the mobile vh issue (at least on chrome -___-)
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Size the canvas to cover the whole window
    backgroundCanvas.width = getBodyDimensions()[0];
    backgroundCanvas.height = getBodyDimensions()[1]; 

    restartBackground();
});

window.addEventListener('resize', () => {
    // mobile vh issue solved
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // size canvas to cover whole window
    backgroundCanvas.width = getBodyDimensions()[0];
    backgroundCanvas.height = getBodyDimensions()[1]; 

    restartBackground();
});

window.addEventListener("mousemove", (event) => {
    // draw a line from the last mouse position to the current
    if(!(lastMouseCoords[0] == 0 && lastMouseCoords[1] == 0)){
        ctx.strokeStyle = `#404054`;
        ctx.beginPath();
        ctx.moveTo(lastMouseCoords[0], lastMouseCoords[1]);
        ctx.lineTo(event.clientX, event.clientY + html.scrollTop);
        ctx.stroke();
    }
    lastMouseCoords[0] = event.clientX;
    lastMouseCoords[1] = event.clientY + html.scrollTop;
});

// ########## Do Stuff ##########

function restartBackground() { 
    ctx.fillStyle = `#16161d`;
    ctx.beginPath();
    ctx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    ctx.stroke();
}

function getBodyDimensions () {
    let dims = new Array(2);

    dims[0] = window.innerWidth;

    dims[1] = Math.max(body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight);
    return dims;
}
