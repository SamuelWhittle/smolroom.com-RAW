var canvas = document.getElementById('mainCanvas'),
    users = document.querySelector('.users'),
    websocket = new WebSocket("wss://smolroom.com:8001/");

canvas.onclick = function (event) {
    websocket.send(JSON.stringify({action: 'minus'}));
}

websocket.onmessage = function (event) {
    data = JSON.parse(event.data);
    switch (data.type) {
        case 'state':
            //value.textContent = data.value;
            break;
        case 'users':
            users.textContent = (
                data.count.toString() + " user" +
                (data.count == 1 ? "" : "s"));
            break;
        default:
            console.error(
                "unsupported event", data);
    }
};
