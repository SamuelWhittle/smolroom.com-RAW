let touchableArray = Array.from(document.getElementsByClassName("touch-controls"));

let touchable = touchableArray[0];

// touch start
touchable.addEventListener('touchstart', event => {
    var touch = event.touches[0];

    var mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.pageX,
        clientY: touch.pageY,
        buttons: 1 /* This simulates a left click specifically */
    });

    touchable.dispatchEvent(mouseEvent);
}, false);

// touch move
touchable.addEventListener("touchmove", event => {
    var touch = event.touches[0];
    
    //var clientX = touch.clientX + touchable.offsetLeft;
    //var clientY = touch.clientY;

    var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.pageX,
        clientY: touch.pageY
    });
    
    touchable.dispatchEvent(mouseEvent);
}, false);

// touch end
window.addEventListener("touchend", event => {
    var mouseEvent = new MouseEvent("mouseup", {});
    window.dispatchEvent(mouseEvent);
}, false);
