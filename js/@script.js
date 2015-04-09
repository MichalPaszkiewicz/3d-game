var canvas = document.getElementById("my-canvas");
canvas.width = canvas.parentElement.offsetWidth;
canvas.height = canvas.parentElement.offsetHeight;
var ctx = canvas.getContext("2d");
var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
var connection = {
    'optional': [{ 'DtlsSrtpKeyAgreement': true }, { 'RtpDataChannels': true }]
};
var peerConnection = new webkitRTCPeerConnection(config, connection);
peerConnection.onicecandidate = function (e) {
    if (!peerConnection || !e || !e.candidate)
        return;
    sendToServer("candidate", { candidate: e.candidate });
};
var dataChannel = peerConnection.createDataChannel("datachannel", { reliable: false });
dataChannel.onmessage = function (e) {
    log("(webRTC) " + e.data);
};
dataChannel.onopen = function () {
    log("------ DATACHANNEL OPENED ------");
};
dataChannel.onclose = function () {
    log("------- DC closed! -------");
};
dataChannel.onerror = function () {
    log("DC ERROR!!!");
};
var sdpConstraints = {
    'mandatory': {
        'OfferToReceiveAudio': false,
        'OfferToReceiveVideo': false
    }
};
function sendOffer() {
    peerConnection.createOffer(function (sdp) {
        peerConnection.setLocalDescription(sdp);
        sendToServer("offer", { from: myID, offer: sdp });
        log("------ SENT OFFER ------");
    }, null, sdpConstraints);
}
function processIce(iceCandidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate), function () {
    }, function () {
    });
}
function processAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    log("------ PROCESSED ANSWER ------");
}
;
function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));
    peerConnection.createAnswer(function (sdp) {
        peerConnection.setLocalDescription(sdp);
        sendToServer("answer", { to: offer.from, from: myID, answer: sdp });
        log("------ SENT ANSWER ------");
    }, null, sdpConstraints);
}
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
    };
    return self;
}
var socket = new WebSocket(serverString);
socket.onopen = Sonopen;
socket.onmessage = Sonmessage;
socket.onclose = Sonclose;
var socketManager = SocketManager();
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
                log("(Server) " + dataJSON.message);
                break;
            case "red":
                log("(Server) " + dataJSON.message, "red");
            case "offer":
                handleOffer(dataJSON.message);
                break;
            case "answer":
                processAnswer(dataJSON.message);
                break;
            case "candidate":
                processIce(dataJSON.message);
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
function sendToServer(type, message) {
    var newItem = Message(type, message);
    socket.send(newItem.asString());
}
var KEYSPRESSED = {
    W: false,
    A: false,
    S: false,
    D: false,
    C: false,
};
window.onkeydown = function (e) {
    switch (e.keyCode) {
        case 87:
            KEYSPRESSED.W = true;
            break;
        case 65:
            KEYSPRESSED.A = true;
            break;
        case 83:
            KEYSPRESSED.S = true;
            break;
        case 68:
            KEYSPRESSED.D = true;
            break;
        case 67:
            KEYSPRESSED.C = true;
            break;
        default:
            console.log(e.keyCode);
    }
};
window.onkeyup = function (e) {
    switch (e.keyCode) {
        case 87:
            KEYSPRESSED.W = false;
            break;
        case 65:
            KEYSPRESSED.A = false;
            break;
        case 83:
            KEYSPRESSED.S = false;
            break;
        case 68:
            KEYSPRESSED.D = false;
            break;
        case 67:
            KEYSPRESSED.C = false;
            break;
        default:
    }
};
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
var element = document.body;
element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
// Ask the browser to lock the pointer
element.onclick = function () {
    element.requestPointerLock();
};
// Ask the browser to release the pointer
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
document.exitPointerLock();
function moveCallback(e) {
    //camera.rotation.x -= e.movementY / 100;
    camera.rotation.y -= e.movementX / 100;
}
function changeCallback(e) {
    console.log(e);
    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
        // Pointer was just locked
        // Enable the mousemove listener
        document.addEventListener("mousemove", moveCallback, false);
    }
    else {
        // Pointer was just unlocked
        // Disable the mousemove listener
        document.removeEventListener("mousemove", moveCallback, false);
        this.unlockHook(this.element);
    }
}
// Hook pointer lock state change events
document.addEventListener('pointerlockchange', changeCallback, false);
document.addEventListener('mozpointerlockchange', changeCallback, false);
document.addEventListener('webkitpointerlockchange', changeCallback, false);
function errorCallback(e) {
    console.log(e);
}
document.addEventListener('pointerlockerror', errorCallback, false);
document.addEventListener('mozpointerlockerror', errorCallback, false);
document.addEventListener('webkitpointerlockerror', errorCallback, false);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 500;
camera.position.y = 0.5;
var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
var cube = new THREE.Mesh(geometry, material);
cube.translateY(0.5);
var egh = new THREE.EdgesHelper(cube, 0x000000);
scene.add(cube);
scene.add(egh);
var geometry2 = new THREE.PlaneGeometry(5, 20, 32);
var material = new THREE.MeshBasicMaterial({ color: 0xbedcc8, side: THREE.DoubleSide });
var plane = new THREE.Mesh(geometry2, material);
plane.rotation.x += Math.PI / 2;
scene.add(plane);
camera.position.z = 5;
renderer.render(scene, camera);
//var controls = new THREE.OrbitControls(camera);
//controls.addEventListener('change', render);
//controls.update();
function render() {
    if (KEYSPRESSED.C) {
        camera.position.y = 0.25;
    }
    else {
        camera.position.y = 0.5;
    }
    cameraUpdate();
    renderer.render(scene, camera);
    window.requestAnimationFrame(render);
}
render();
function cameraUpdate() {
    var speed = 0.05;
    if (KEYSPRESSED.W) {
        camera.translateZ(-speed);
    }
    if (KEYSPRESSED.S) {
        camera.translateZ(speed);
    }
    if (KEYSPRESSED.A) {
        camera.translateX(-speed);
    }
    if (KEYSPRESSED.D) {
        camera.translateX(speed);
    }
}
var Logger = function () {
    var self = this;
    self.height = canvas.height;
    self.logs = [];
    self.log = function (text, colour) {
        if (colour == null) {
            colour = "black";
        }
        self.logs.push({ text: text, colour: colour });
    };
    self.drawLog = function () {
        var cutoff = 0;
        if (10 * self.logs.length + 10 > self.height) {
            cutoff = 10 * self.logs.length + 10 - self.height;
        }
        for (var i = 0; i < self.logs.length; i++) {
            ctx.fillStyle = self.logs[i].colour;
            ctx.fillText(self.logs[i].text, 10, 10 * i + 10 - cutoff);
        }
    };
    self.clearLog = function () {
        self.logs = [];
    };
    return self;
};
var currentLog = new Logger();
function log(text, colour) {
    currentLog.log(text, colour);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentLog.drawLog();
}
function serverChat(message) {
    sendToServer("chat", message);
    log("me: " + message);
}
function chat(message) {
    dataChannel.send(myID + ": " + message);
    log("me: " + message);
}
var Message = function (type, message) {
    var self = {
        content: {
            type: type,
            message: message
        },
        asString: function () {
            return JSON.stringify(self.content);
        }
    };
    return self;
};
//# sourceMappingURL=@script.js.map