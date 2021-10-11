// ########## Globals ##########
let lastMouseCoords = new Array(2).fill(0);

// ########## HTML DOM Elements ##########
let backgroundCanvas = document.getElementById("backgroundCanvas");

// ########## DOM Helpers ##########
let ctx = backgroundCanvas.getContext('2d');

// ########## Event Listeners ##########
window.addEventListener('load', () => {
    // Solving the mobile vh issue (at least on chrome -___-)
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight 
});

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight 
});

window.addEventListener("mousemove", (event) => {
    if(!(lastMouseCoords[0] == 0 && lastMouseCoords[1] == 0)){
        ctx.strokeStyle = `#f0f0f0`;
        ctx.beginPath();
        ctx.moveTo(lastMouseCoords[0], lastMouseCoords[1]);
        ctx.lineTo(event.clientX, event.clientY);
        ctx.stroke();
    }
    lastMouseCoords[0] = event.clientX;
    lastMouseCoords[1] = event.clientY;
});

// ########## Do Stuff ##########

