var serverString = "ws:localhost:8080";

var myID = Math.random().toString(16).replace('0.', '');

function SocketManager() {
    var self = this;
    self.retries = 10;
    self.currentRetries = 0;

    self.reconnect = function () {
        self.currentRetries++;
        log("reconnecting... (attempt:" + self.currentRetries + ")");
        try {
            socket = new WebSocket(serverString);
            socket.onopen = Sonopen;
            socket.onmessage = Sonmessage;
            socket.onclose = Sonclose;
        }
        catch (e) {

        }
    }

    return self;
}

var socket = new WebSocket(serverString);

socket.onopen = Sonopen;
socket.onmessage = Sonmessage;
socket.onclose = Sonclose;

var socketManager = new SocketManager();

function Sonopen() {
    log("connected to WebSocket");
    sendToServer("ID", myID);
    socketManager.currentRetries = 0;
}

function Sonmessage(msg) {
    var data = msg.data;
    var dataJSON = JSON.parse(data);

    if (dataJSON != null) {
        switch (dataJSON.type) {
            case "text":
                log(dataJSON.message);
                break;
            default:
                log(dataJSON);
        }
    }
    else {
        log("Received erroneous message from websocket", "red");
    }
}

function Sonclose() {
    log("connection to WebSocket failed", "red");
    if (socketManager.currentRetries < socketManager.retries) {
        setTimeout(function () {
            socketManager.reconnect();
        }, 1000);
    }
    else {
        socketManager.currentRetries = 0;
        log("reconnection aborted.", "red")
    }
}

function sendToServer(type, message) {
    var newItem = new Message(type, message);
    socket.send(newItem.asString());
}