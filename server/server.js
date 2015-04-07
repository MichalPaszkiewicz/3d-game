var WebSocket = require('ws');
var m = require('./message.js');

var WebSocketServer = WebSocket.Server;

var wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function (ws) {

    ws.on('message', function (message) {
        console.log('received: %s', message);

        var message = new m.message("text", "socket received: " + message);

        ws.send(message.asString());
    });

    ws.on("close", function () {
        console.log("connection lost");
    });

    console.log("connected");
});