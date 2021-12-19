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

let imgArray;

let mainContentItemDims;

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
    
    // adjust size of background canvas and set color
    restartBackground();

    //adjust picture sizes based on the main-content-items containing them
    adjustImgDims();

});

window.addEventListener('resize', () => {
    // mobile vh issue solved
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // size canvas to cover whole window
    restartBackground();
    
    adjustImgDims();
});

window.addEventListener("mousemove", (event) => {
    // draw a line from the last mouse position to the current
    if(!(lastMouseCoords[0] == 0 && lastMouseCoords[1] == 0)){
        ctx.strokeStyle = `#404054`;
        ctx.beginPath();
        ctx.moveTo(lastMouseCoords[0], lastMouseCoords[1]);
        ctx.lineTo(event.clientX, event.clientY);
        ctx.stroke();
    }
    lastMouseCoords[0] = event.clientX;
    lastMouseCoords[1] = event.clientY;
});

// ########## functions ##########
function adjustImgDims() {
    imgArray = Array.from(document.getElementsByTagName('img'));

    mainContentItemDims = new Array(imgArray.length).fill(new Array(2));

    imgArray.map((img, index) => {
        if(window.innerWidth < 529) {
            mainContentItemDims[index][0] = img.parentElement.parentElement.clientWidth;
            mainContentItemDims[index][1] = img.parentElement.parentElement.clientHeight;

            img.style.setProperty('width', `${mainContentItemDims[index][0]}px`);
            img.style.setProperty('height', `${mainContentItemDims[index][1]}px`);
        } else {
            img.style.setProperty('width', `auto`);
            img.style.setProperty('height', `100%`);
        }
    });

    //console.log(mainContentItemDims);
}

function restartBackground() {
    console.log('adjusting background canvas size');
    // Size the canvas to cover the whole window
    //let bodyDims = getBodyDimensions();
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight; 
    
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

// ########## Initial Setup ##########
