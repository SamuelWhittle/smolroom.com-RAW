// adjust the css variable vh to be 1% of the current window inner height
function adjustDocumentSize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// listen for window load and resize to resize the document accordingly
window.addEventListener('load', adjustDocumentSize);
window.addEventListener('resize', adjustDocumentSize);
