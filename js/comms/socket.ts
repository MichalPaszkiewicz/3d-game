module App.Comms {
    import log = Display.log;

    var serverString = "ws:localhost:8080";

    export var myID = Math.random().toString(16).replace("0.", "");

    var socket = new WebSocket(serverString);

    socket.onopen = Sonopen;
    socket.onmessage = Sonmessage;
    socket.onclose = Sonclose;

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
                log(e.message);
            }
        };

        return self;
    }

    var socketManager = SocketManager();

    function Sonopen() {
        log("connected to WebSocket");
        sendToServer("ID", myID);
        socketManager.currentRetries = 0;
    }

    function Sonmessage(msg: any) {
        var data = msg.data;
        var dataJSON = JSON.parse(data);

        if (dataJSON != null) {
            switch (dataJSON.type) {
                case "text":
                    log("(Server) " + dataJSON.message);
                    break;
                case "red":
                    log("(Server) " + dataJSON.message, "red");
                case "offer":
                    handleOffer(App.Comms.peerConnection, dataJSON.message);
                    break;
                case "answer":
                    processAnswer(App.Comms.peerConnection, dataJSON.message);
                    break;
                case "candidate":
                    processIce(App.Comms.peerConnection, dataJSON.message);
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
            log("reconnection aborted.", "red");
        }
    }

    export function sendToServer(type: string, message: string | Object) {
        var newItem = Message(type, message);
        socket.send(newItem.asString());
    }
}