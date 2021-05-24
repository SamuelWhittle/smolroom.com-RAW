// express and socket.io boilerplate
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

console.log("My socket server is running");

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

server.listen(8080, () => {
    console.log('listening on *:8080');
});

