var WebSocket = require('ws');
var m = require('./message.js');
var p = require('./peer.js');

var WebSocketServer = WebSocket.Server;

var wss = new WebSocketServer({ port: 8080 });

var peers = new p.Peers();

wss.on('connection', function (ws) {

    ws.on('message', function (message) {
        console.log('received: %s', message);

        var response = {};

        try{
            var messageJSON = JSON.parse(message);

            switch (messageJSON.type) {
                case "text":
                    if (typeof messageJSON.message == "string") {
                        response = new m.Message("text", messageJSON.message);
                    }
                    else {
                        response = new m.Message("text", JSON.stringify(messageJSON.message));
                    }
                    break;
                case "chat":
                    if (typeof messageJSON.message == "string") {
                        response = new m.Message("text", ws.connectionID + ": " + messageJSON.message);
                    }
                    else {
                        response = new m.Message("text", ws.connectionID + ": " + JSON.stringify(messageJSON.message));
                    }
                    var others = peers.getOthers(ws.connectionID);
                    for (var i = 0; i < others.length; i++) {
                        others[i].ws.send(response.asString());
                    }
                    return;
                case "ID":
                    ws.connectionID = messageJSON.message;
                    peers.add(messageJSON.message, ws);
                    console.log("peer " + messageJSON.message + " added.");
                    response = new m.Message("text", "person " + messageJSON.message + " has connected");
                    var others = peers.getOthers(messageJSON.message);
                    for (var i = 0; i < others.length; i++) {
                        others[i].ws.send(response.asString());
                    }
                    return;
                case "offer":
                    break;
                case "answer":
                    break;
                case "candidate":
                    break;
                default:
                    console.log("Defaulted");
                    response = new m.Message("text", "socket received: " + message);
            }
        }
        catch (e) {
            response = new m.Message("text", "socket received: " + JSON.stringify(message));
            console.log("error: " + e.message);
            console.log("stack: " + e.stack);
        }

        ws.send(response.asString());
    });

    ws.on("close", function () {
        console.log("connection lost");
        peers.remove(ws.connectionID);
    });

    console.log("connected");
});