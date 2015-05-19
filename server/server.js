var WebSocket = require('ws');
var m = require('./message.js');
var p = require('./peer.js');

var WebSocketServer = WebSocket.Server;

var wss = new WebSocketServer({ port: 8080 });

var peers = new p.Peers();

function sendToOthers(ID, response) {
    var others = peers.getOthers(ID);
    for (var i = 0; i < others.length; i++) {
        others[i].ws.send(response.asString());
    }
}

function sendToPerson(ID, response){
    var person = peers.getParticular(ID);
    person.ws.send(response.asString());
}

wss.on('connection', function (ws) {

    ws.on('message', function (message) {
        var logmsg = ('received: ' + message);
        if(message.length > 70){
            logmsg = logmsg.substring(0,70) + "...";
        }
        console.log(logmsg);

        var response = {};

        try{
            var messageJSON = JSON.parse(message);

            switch (messageJSON.type) {
                case "text":
                    if (typeof messageJSON.message == "string") {
                        response = new m.Message("text", messageJSON.message, messageJSON.from);
                    }
                    else {
                        response = new m.Message("text", JSON.stringify(messageJSON.message), messageJSON.from);
                    }
                    break;
                case "chat":
                    if (typeof messageJSON.message == "string") {
                        response = new m.Message("text", ws.connectionID + ": " + messageJSON.message, messageJSON.from);
                    }
                    else {
                        response = new m.Message("text", ws.connectionID + ": " + JSON.stringify(messageJSON.message), messageJSON.from);
                    }
                    sendToOthers(ws.connectionID, response);
                    return;
                case "ID":
                    ws.connectionID = messageJSON.message;
                    peers.add(messageJSON.message, ws);
                    console.log("peer " + messageJSON.message + " added.");
                    response = new m.Message("connexion", "person " + messageJSON.message + " has connected", messageJSON.from);
                    sendToOthers(messageJSON.message, response);
                    return;
                case "offer":
                    var response = new m.Message("offer", messageJSON.message, messageJSON.from);
                    sendToOthers(ws.connectionID, response);
                    return;
                case "answer":
                    var response = new m.Message("answer", messageJSON.message.answer, messageJSON.from);
                    sendToPerson(messageJSON.message.to, response);
                    return;
                case "candidate":
                    response = new m.Message("candidate", messageJSON.message.candidate, messageJSON.from);
                    sendToOthers(ws.connectionID, response);
                    return;
                default:
                    console.log("Defaulted");
                    response = new m.Message("text", "socket received: " + message, messageJSON.from);
            }
        }
        catch (e) {
            response = new m.Message("text", "socket received: " + JSON.stringify(message), messageJSON.from);
            console.log("error: " + e.message);
            //console.log("stack: " + e.stack);
        }

        ws.send(response.asString());
    });

    ws.on("close", function () {
        response = new m.Message("red", "person " + ws.connectionID + " has disconnected.");
        sendToOthers(ws.connectionID, response);
        console.log("connection to " + ws.connectionID + " lost");
        peers.remove(ws.connectionID);
    });

    console.log("connected");
});

console.log("server open on: ws:localhost:8080")