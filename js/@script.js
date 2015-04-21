var App;
(function (App) {
    App.canvas = document.getElementById("my-canvas");
    App.canvas.width = App.canvas.parentElement.offsetWidth;
    App.canvas.height = App.canvas.parentElement.offsetHeight;
    App.ctx = App.canvas.getContext("2d");
    // canvas is only redrawn when this is set to true.
    App.canvasNeedsUpdate = false;
})(App || (App = {}));
var App;
(function (App) {
    var Display;
    (function (Display) {
        var Logger = function () {
            var self = this;
            self.height = App.canvas.height;
            self.logs = [];
            self.log = function (text, colour) {
                if (colour == null) {
                    colour = "black";
                }
                if (self.logs.length > 0 && self.logs[self.logs.length - 1].text == text) {
                    self.logs[self.logs.length - 1].count++;
                }
                else {
                    self.logs.push({ text: text, colour: colour, count: 0 });
                }
            };
            self.drawLog = function () {
                var cutoff = 0;
                if (10 * self.logs.length + 10 > self.height) {
                    cutoff = 10 * self.logs.length + 10 - self.height;
                }
                for (var i = 0; i < self.logs.length; i++) {
                    App.ctx.fillStyle = self.logs[i].colour;
                    var displayText = self.logs[i].text;
                    if (self.logs[i].count > 0) {
                        displayText += " (" + self.logs[i].count + ")";
                    }
                    App.ctx.fillText(displayText, 10, 10 * i + 10 - cutoff);
                }
            };
            self.clearLog = function () {
                self.logs = [];
            };
            return self;
        };
        Display.currentLog = new Logger();
        function log(text, colour) {
            Display.currentLog.log(text, colour);
            App.canvasNeedsUpdate = true;
        }
        Display.log = log;
    })(Display = App.Display || (App.Display = {}));
})(App || (App = {}));
/// <reference path="../displays/logger.ts" />
var App;
(function (App) {
    var Comms;
    (function (Comms) {
        var log = App.Display.log;
        Comms.config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
        Comms.connection = {
            "optional": [{ "DtlsSrtpKeyAgreement": true }, { "RtpDataChannels": true }]
        };
        Comms.peerConnection = new webkitRTCPeerConnection(Comms.config, Comms.connection);
        Comms.peerConnection.onicecandidate = function (e) {
            if (!Comms.peerConnection || !e || !e.candidate) {
                return;
            }
            Comms.sendToServer("candidate", { candidate: e.candidate });
        };
        Comms.dataChannel = Comms.peerConnection.createDataChannel("datachannel", { reliable: false });
        Comms.dataChannel.onmessage = function (e) {
            var data = e.data;
            var dataJSON = JSON.parse(data);
            if (dataJSON != null) {
                switch (dataJSON.type) {
                    case "text":
                        log("(webRTC) " + dataJSON.message);
                        break;
                    case "red":
                        log("(webRTC) " + dataJSON.message, "red");
                        break;
                    case "game":
                        App.processGameData(dataJSON.message);
                        break;
                    default:
                        log(dataJSON);
                }
            }
            else {
                log("Received erroneous message from websocket", "red");
            }
        };
        Comms.dataChannel.onopen = function () {
            log("------ DATACHANNEL OPENED ------");
        };
        Comms.dataChannel.onclose = function () {
            log("------- DC closed! -------");
        };
        Comms.dataChannel.onerror = function () {
            log("DC ERROR!!!");
        };
        Comms.sdpConstraints = {
            "mandatory": {
                "OfferToReceiveAudio": false,
                "OfferToReceiveVideo": false
            }
        };
        function sendOffer() {
            "use strict";
            Comms.peerConnection.createOffer(function (sdp) {
                Comms.peerConnection.setLocalDescription(sdp);
                Comms.sendToServer("offer", { from: Comms.myID, offer: sdp });
                log("------ SENT OFFER ------");
            }, null, Comms.sdpConstraints);
        }
        Comms.sendOffer = sendOffer;
        function processIce(iceCandidate) {
            "use strict";
            Comms.peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate), function () {
                // todo: do something in here
            }, function () {
                // todo: do something in here
            });
        }
        Comms.processIce = processIce;
        function processAnswer(answer) {
            "use strict";
            Comms.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            log("------ PROCESSED ANSWER ------");
        }
        Comms.processAnswer = processAnswer;
        ;
        function handleOffer(offer) {
            Comms.peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));
            Comms.peerConnection.createAnswer(function (sdp) {
                Comms.peerConnection.setLocalDescription(sdp);
                Comms.sendToServer("answer", { to: offer.from, from: Comms.myID, answer: sdp });
                log("------ SENT ANSWER ------");
            }, null, Comms.sdpConstraints);
        }
        Comms.handleOffer = handleOffer;
    })(Comms = App.Comms || (App.Comms = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Comms;
    (function (Comms) {
        var log = App.Display.log;
        var serverString = "ws:localhost:8080";
        Comms.myID = Math.random().toString(16).replace("0.", "");
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
            sendToServer("ID", Comms.myID);
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
                        Comms.handleOffer(dataJSON.message);
                        break;
                    case "answer":
                        Comms.processAnswer(dataJSON.message);
                        break;
                    case "candidate":
                        Comms.processIce(dataJSON.message);
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
            var newItem = App.Message(type, message);
            socket.send(newItem.asString());
        }
        Comms.sendToServer = sendToServer;
    })(Comms = App.Comms || (App.Comms = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Control;
    (function (Control) {
        Control.KEYSPRESSED = {
            W: false,
            A: false,
            S: false,
            D: false,
            C: false,
            SHIFT: false
        };
        window.onkeydown = function (e) {
            switch (e.keyCode) {
                case 87:
                    Control.KEYSPRESSED.W = true;
                    break;
                case 65:
                    Control.KEYSPRESSED.A = true;
                    break;
                case 83:
                    Control.KEYSPRESSED.S = true;
                    break;
                case 68:
                    Control.KEYSPRESSED.D = true;
                    break;
                case 67:
                    Control.KEYSPRESSED.C = true;
                    break;
                case 16:
                    Control.KEYSPRESSED.SHIFT = true;
                    break;
                default:
                    console.log(e.keyCode);
            }
        };
        window.onkeyup = function (e) {
            switch (e.keyCode) {
                case 87:
                    Control.KEYSPRESSED.W = false;
                    break;
                case 65:
                    Control.KEYSPRESSED.A = false;
                    break;
                case 83:
                    Control.KEYSPRESSED.S = false;
                    break;
                case 68:
                    Control.KEYSPRESSED.D = false;
                    break;
                case 67:
                    Control.KEYSPRESSED.C = false;
                    break;
                case 16:
                    Control.KEYSPRESSED.SHIFT = false;
                    break;
                default:
            }
        };
    })(Control = App.Control || (App.Control = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Control;
    (function (Control) {
        var havePointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
        var element = document.body;
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        // ask the browser to lock the pointer
        element.onclick = function () {
            element.requestPointerLock();
        };
        // ask the browser to release the pointer
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        document.exitPointerLock();
        var cameraXAxis = new THREE.Vector3(1, 0, 0);
        var rotationYAxis = new THREE.Vector3(0, 1, 0);
        Control.fullRotationX = 0;
        Control.fullRotationY = 0;
        Control.zoom = false;
        function getScaleFactor() {
            return 100 * (Control.zoom ? 32 : 1);
        }
        function moveCallback(e) {
            var scaleFactor = getScaleFactor();
            if (Math.abs(Control.fullRotationX - e.movementY / scaleFactor) < (Math.PI / 2)) {
                App.Display.camera.rotateOnAxis(cameraXAxis, -e.movementY / scaleFactor);
                rotationYAxis.applyAxisAngle(cameraXAxis, e.movementY / scaleFactor);
                Control.fullRotationX -= e.movementY / scaleFactor;
                Control.fullRotationY -= e.movementX / scaleFactor;
            }
            App.Display.camera.rotateOnAxis(rotationYAxis, -e.movementX / scaleFactor);
        }
        function clickCallback(e) {
            // leftclick
            if (e.button == 0) {
                App.Display.fire();
            }
            // middleclick
            if (e.button == 1) {
            }
            // rightclick
            if (e.button == 2) {
                Control.zoom = !Control.zoom;
                App.Display.toggleZoom();
            }
        }
        function changeCallback(e) {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                // pointer was just locked
                // enable the mousemove listener
                document.addEventListener("mousemove", moveCallback, false);
                document.addEventListener("mousedown", clickCallback, false);
            }
            else {
                // pointer was just unlocked
                // disable the mousemove listener
                document.removeEventListener("mousemove", moveCallback, false);
                document.removeEventListener("mousedown", clickCallback, false);
            }
        }
        // hook pointer lock state change events
        document.addEventListener("pointerlockchange", changeCallback, false);
        document.addEventListener("mozpointerlockchange", changeCallback, false);
        document.addEventListener("webkitpointerlockchange", changeCallback, false);
        function errorCallback(e) {
            console.log(e);
        }
        document.addEventListener("pointerlockerror", errorCallback, false);
        document.addEventListener("mozpointerlockerror", errorCallback, false);
        document.addEventListener("webkitpointerlockerror", errorCallback, false);
    })(Control = App.Control || (App.Control = {}));
})(App || (App = {}));
var App;
(function (App) {
    var ME;
    (function (ME) {
        ME.energy = 100;
        ME.health = 100;
    })(ME = App.ME || (App.ME = {}));
})(App || (App = {}));
/// <reference path="../objects/me.ts" />
var App;
(function (App) {
    var Display;
    (function (Display) {
        function drawEnergyBar() {
            if (App.ME.energy != null) {
                App.ctx.beginPath();
                App.ctx.fillStyle = "blue";
                App.ctx.fillRect(App.canvas.width - 110, App.canvas.height - 20, App.ME.energy, 10);
                App.ctx.strokeRect(App.canvas.width - 110, App.canvas.height - 20, 100, 10);
            }
        }
        Display.drawEnergyBar = drawEnergyBar;
        function drawHealthBar() {
            if (App.ME.health != null) {
                App.ctx.beginPath();
                App.ctx.fillStyle = "red";
                App.ctx.fillRect(App.canvas.width - 110, App.canvas.height - 35, App.ME.health, 10);
                App.ctx.strokeRect(App.canvas.width - 110, App.canvas.height - 35, 100, 10);
            }
        }
        Display.drawHealthBar = drawHealthBar;
    })(Display = App.Display || (App.Display = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Display;
    (function (Display) {
        (function (crossHairType) {
            crossHairType[crossHairType["STANDARD"] = 0] = "STANDARD";
            crossHairType[crossHairType["SNIPER"] = 1] = "SNIPER";
            crossHairType[crossHairType["SNIPER_ZOOM"] = 2] = "SNIPER_ZOOM";
        })(Display.crossHairType || (Display.crossHairType = {}));
        var crossHairType = Display.crossHairType;
        ;
        var crossHairs = [
            {
                name: "standard",
                draw: function () {
                    App.ctx.strokeStyle = "rgba(0,0,255,0.8)";
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2 - 10, App.canvas.height / 2);
                    App.ctx.lineTo(App.canvas.width / 2 - 20, App.canvas.height / 2);
                    App.ctx.stroke();
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2 + 10, App.canvas.height / 2);
                    App.ctx.lineTo(App.canvas.width / 2 + 20, App.canvas.height / 2);
                    App.ctx.stroke();
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2, App.canvas.height / 2 - 10);
                    App.ctx.lineTo(App.canvas.width / 2, App.canvas.height / 2 - 20);
                    App.ctx.stroke();
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2, App.canvas.height / 2 + 10);
                    App.ctx.lineTo(App.canvas.width / 2, App.canvas.height / 2 + 20);
                    App.ctx.stroke();
                    App.ctx.strokeStyle = "black";
                }
            },
            {
                name: "sniper",
                draw: function () {
                    App.ctx.strokeStyle = "rgba(0,0,255,0.8)";
                    App.ctx.beginPath();
                    App.ctx.arc(App.canvas.width / 2, App.canvas.height / 2, 20, 0, 2 * Math.PI);
                    App.ctx.stroke();
                    App.ctx.beginPath();
                    App.ctx.arc(App.canvas.width / 2, App.canvas.height / 2, 40, 0, 2 * Math.PI);
                    App.ctx.stroke();
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2 - 50, App.canvas.height / 2);
                    App.ctx.lineTo(App.canvas.width / 2 + 50, App.canvas.height / 2);
                    App.ctx.stroke();
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2, App.canvas.height / 2 - 50);
                    App.ctx.lineTo(App.canvas.width / 2, App.canvas.height / 2 + 50);
                    App.ctx.stroke();
                    App.ctx.strokeStyle = "black";
                }
            },
            {
                name: "sniper_zoom",
                draw: function () {
                    var scopeR = 300;
                    App.ctx.fillStyle = "black";
                    App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
                    App.ctx.globalCompositeOperation = "xor";
                    App.ctx.beginPath();
                    App.ctx.arc(App.canvas.width / 2, App.canvas.height / 2, scopeR, 0, Math.PI * 2, false);
                    App.ctx.closePath();
                    App.ctx.fill();
                    App.ctx.restore();
                    App.ctx.beginPath();
                    App.ctx.strokeStyle = "black";
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2 - scopeR, App.canvas.height / 2);
                    App.ctx.lineTo(App.canvas.width / 2 + scopeR, App.canvas.height / 2);
                    App.ctx.stroke();
                    App.ctx.beginPath();
                    App.ctx.moveTo(App.canvas.width / 2, App.canvas.height / 2 - scopeR);
                    App.ctx.lineTo(App.canvas.width / 2, App.canvas.height / 2 + scopeR);
                    App.ctx.stroke();
                }
            }
        ];
        Display.currentCrossHair = 0 /* STANDARD */;
        function drawCrossHair() {
            crossHairs[Display.currentCrossHair].draw();
        }
        Display.drawCrossHair = drawCrossHair;
    })(Display = App.Display || (App.Display = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Display;
    (function (Display) {
        var KEYSPRESSED = App.Control.KEYSPRESSED;
        Display.scene = new THREE.Scene();
        Display.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        Display.camera.position.z = 500;
        Display.camera.position.y = 0.75;
        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        var geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        var cube = new THREE.Mesh(geometry, material);
        cube.translateY(0.5);
        var egh = new THREE.EdgesHelper(cube, 0x000000);
        Display.scene.add(cube);
        Display.scene.add(egh);
        var geometry2 = new THREE.PlaneGeometry(20, 20, 32);
        var material2 = new THREE.MeshBasicMaterial({ color: 0xbbffb1, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry2, material2);
        plane.rotation.x += Math.PI / 2;
        Display.scene.add(plane);
        Display.camera.position.z = 5;
        renderer.render(Display.scene, Display.camera);
        // var controls = new THREE.OrbitControls(camera);
        // controls.addEventListener('change', render);
        // controls.update();
        function render() {
            if (KEYSPRESSED.C) {
                Display.camera.position.y = 0.25;
            }
            else {
                Display.camera.position.y = 0.75;
            }
            if (Display.bullets != null && updateAllBullets != null) {
                updateAllBullets();
            }
            cameraUpdate();
            renderer.render(Display.scene, Display.camera);
            if (Display.currentLog != null && App.canvasNeedsUpdate) {
                App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);
                Display.currentLog.drawLog();
                Display.drawEnergyBar();
                Display.drawHealthBar();
                Display.drawCrossHair();
                App.canvasNeedsUpdate = false;
            }
            window.requestAnimationFrame(render);
        }
        render();
        function speed() {
            if (KEYSPRESSED.C) {
                return 0.01;
            }
            if (KEYSPRESSED.SHIFT) {
                if (canRun()) {
                    return 0.08;
                }
            }
            else {
                Rest();
            }
            return 0.03;
        }
        function canRun() {
            if (App.ME.energy > 0) {
                App.ME.energy -= 3;
                App.canvasNeedsUpdate = true;
                return true;
            }
            else {
                return false;
            }
        }
        function Rest() {
            if (App.ME.energy < 100) {
                App.ME.energy++;
                App.canvasNeedsUpdate = true;
            }
        }
        function cameraUpdate() {
            var currentSpeed = speed();
            if (KEYSPRESSED.W) {
                Display.camera.translateZ(-currentSpeed);
            }
            if (KEYSPRESSED.S) {
                Display.camera.translateZ(currentSpeed);
            }
            if (KEYSPRESSED.A) {
                Display.camera.translateX(-currentSpeed);
            }
            if (KEYSPRESSED.D) {
                Display.camera.translateX(currentSpeed);
            }
        }
        function sendThePosition() {
            if (App.sendGameDataOrKill != null && App.GameDataType != null && App.Comms.dataChannel.readyState == "open") {
                try {
                    App.sendGameDataOrKill(1 /* POSITION */, {
                        x: Display.camera.position.x,
                        z: Display.camera.position.z,
                        d: App.Control.fullRotationY
                    });
                }
                catch (e) {
                    Display.log(e.message, "orange");
                }
                setTimeout(sendThePosition, 50);
            }
            else {
                setTimeout(sendThePosition, 500);
            }
        }
        sendThePosition();
        Display.bullets = [];
        var updateAllBullets = function () {
            for (var i = 0; i < Display.bullets.length; i++) {
                Display.bullets[i].updatePosition();
            }
            var newBullets = [];
            for (var i = 0; i < Display.bullets.length; i++) {
                if (Display.bullets[i].age >= Display.bullets[i].settings.lifeSpan) {
                    Display.scene.remove(Display.bullets[i].mesh);
                }
                else {
                    newBullets.push(Display.bullets[i]);
                }
            }
            Display.bullets = newBullets;
        };
        function addBullet(bullet) {
            Display.bullets.push(bullet);
        }
        Display.addBullet = addBullet;
        function fire() {
            var tempBullet = App.Combat.addBulletType(0 /* NORMAL */, Display.scene, Display.camera, !App.Control.zoom);
            addBullet(tempBullet);
            App.sendGameDataOrKill(0 /* BULLET */, {
                type: tempBullet.type,
                settings: tempBullet.settings,
                position: tempBullet.mesh.position,
                velocity: tempBullet.velocity
            });
            if (App.Control.zoom) {
                App.Control.zoom = !App.Control.zoom;
                toggleZoom();
            }
        }
        Display.fire = fire;
        function toggleZoom() {
            if (App.Control.zoom) {
                Display.camera.fov /= 16;
                App.Display.currentCrossHair = 2 /* SNIPER_ZOOM */;
            }
            else {
                Display.camera.fov *= 16;
                App.Display.currentCrossHair = 0 /* STANDARD */;
            }
            App.canvasNeedsUpdate = true;
            Display.camera.updateProjectionMatrix();
        }
        Display.toggleZoom = toggleZoom;
        Display.otherPerson;
        function drawPerson() {
            var loader = new THREE.ObjectLoader();
            loader.load("js/models/baymax.json", function (obj) {
                obj.scale.x = 0.01;
                obj.scale.y = 0.01;
                obj.scale.z = 0.01;
                obj.translateX(2);
                obj.translateY(0.75);
                Display.otherPerson = obj;
                Display.scene.add(obj);
            });
        }
        function handleMovement(pos) {
            Display.otherPerson.position.x = pos.x;
            Display.otherPerson.position.z = pos.z;
            Display.otherPerson.rotation.y = pos.d + Math.PI;
        }
        Display.handleMovement = handleMovement;
        drawPerson();
        var light = new THREE.PointLight(0xff0000, 1, 100);
        light.position.set(5, 5, 1);
        Display.scene.add(light);
    })(Display = App.Display || (App.Display = {}));
})(App || (App = {}));
var App;
(function (App) {
    function serverChat(message) {
        App.Comms.sendToServer("chat", message);
        App.Display.log("me: " + message);
    }
    App.serverChat = serverChat;
    function chat(text) {
        rtcSendOrKill("text", App.Comms.myID + ": " + text);
        logOrDefault("me: " + text, "black");
    }
    App.chat = chat;
    // for use if all things are breaking.
    function logOrDefault(text, colour) {
        if (App.Display.log != null) {
            App.Display.log(text, colour);
        }
        else {
            if (colour == null) {
                colour = "black";
            }
            console.log("%c" + text, colour);
        }
    }
    function rtcSendOrKill(msgType, data) {
        if (App.Comms != null && App.Comms.dataChannel != null && App.Comms.dataChannel.send != null) {
            var message = App.Message(msgType, data);
            App.Comms.dataChannel.send(message.asString());
            return;
        }
        logOrDefault("MainTS: Error sending RTC msg", "orange");
    }
    App.rtcSendOrKill = rtcSendOrKill;
    function sendGameDataOrKill(type, data) {
        if (App.Comms == null || App.Comms.dataChannel == null || App.Comms.dataChannel.send == null || App.Comms.dataChannel.readyState != "open") {
            logOrDefault("MainTS: DataChannel not yet set up", "orange");
            return;
        }
        var gameData = new App.GameData(type, data);
        var message = App.Message("game", gameData);
        App.Comms.dataChannel.send(message.asString());
    }
    App.sendGameDataOrKill = sendGameDataOrKill;
    function processGameData(data) {
        switch (data.type) {
            case 0 /* BULLET */:
                var bullet = new App.Combat.ImportBullet(data.data["type"], data.data["settings"]);
                bullet.mesh.position.x = data.data["position"].x;
                bullet.mesh.position.y = data.data["position"].y;
                bullet.mesh.position.z = data.data["position"].z;
                bullet.velocity = data.data["velocity"];
                App.Display.addBullet(bullet);
                App.Display.scene.add(bullet.mesh);
                return;
            case 1 /* POSITION */:
                App.Display.handleMovement(data.data);
                return;
            default:
                logOrDefault("Error with processing game data", "orange");
                return;
        }
    }
    App.processGameData = processGameData;
})(App || (App = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var App;
(function (App) {
    var AI = (function (_super) {
        __extends(AI, _super);
        function AI(name) {
            _super.call(this, name);
        }
        return AI;
    })(App.Player);
    App.AI = AI;
})(App || (App = {}));
var App;
(function (App) {
    var Combat;
    (function (Combat) {
        var camera = App.Display.camera;
        (function (BulletType) {
            BulletType[BulletType["NORMAL"] = 0] = "NORMAL";
            BulletType[BulletType["FAST"] = 1] = "FAST";
        })(Combat.BulletType || (Combat.BulletType = {}));
        var BulletType = Combat.BulletType;
        var BulletSetting = (function () {
            function BulletSetting(speed, damage, lifeSpan) {
                this.bulletSpeed = speed;
                this.damage = damage;
                this.lifeSpan = lifeSpan;
                this.colour = "red";
            }
            return BulletSetting;
        })();
        function getBulletSettings(type) {
            switch (type) {
                case 1 /* FAST */:
                    return new BulletSetting(0.5, 10, 1000);
                case 0 /* NORMAL */:
                default:
                    return new BulletSetting(0.1, 10, 1000);
            }
        }
        function getBulletMesh(type) {
            var bulletMesh;
            switch (type) {
                case 0 /* NORMAL */:
                default:
                    var circleGeometry = new THREE.SphereGeometry(0.02);
                    var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                    bulletMesh = new THREE.Mesh(circleGeometry, bulletMaterial);
            }
            return bulletMesh;
        }
        var Bullet = (function () {
            function Bullet(ammoType, mesh, settings) {
                this.type = ammoType;
                this.mesh = mesh;
                this.age = 0;
                this.settings = settings;
                var vector = new THREE.Vector3(0, 0, -1);
                vector.applyQuaternion(camera.quaternion);
                this.velocity = vector;
                this.updatePosition = function () {
                    this.mesh.position.x += this.velocity.x * this.settings.bulletSpeed;
                    this.mesh.position.y += this.velocity.y * this.settings.bulletSpeed;
                    this.mesh.position.z += this.velocity.z * this.settings.bulletSpeed;
                    this.age++;
                };
            }
            return Bullet;
        })();
        Combat.Bullet = Bullet;
        var ImportBullet = (function (_super) {
            __extends(ImportBullet, _super);
            function ImportBullet(ammoType, settings) {
                var mesh = getBulletMesh(ammoType);
                _super.call(this, ammoType, mesh, settings);
                this.updatePosition = function () {
                    this.mesh.position.x += this.velocity.x * this.settings.bulletSpeed;
                    this.mesh.position.y += this.velocity.y * this.settings.bulletSpeed;
                    this.mesh.position.z += this.velocity.z * this.settings.bulletSpeed;
                    this.age++;
                };
            }
            return ImportBullet;
        })(Bullet);
        Combat.ImportBullet = ImportBullet;
        function addBulletType(ammoType, scene, camera, fromWeapon) {
            var bullet = new Bullet(ammoType, getBulletMesh(ammoType), getBulletSettings(ammoType));
            var vector = new THREE.Vector3();
            if (fromWeapon) {
                vector.setFromMatrixPosition(App.Combat.weapon.mesh.matrixWorld);
            }
            else {
                vector.setFromMatrixPosition(App.Display.camera.matrixWorld);
            }
            bullet.mesh.position.x = vector.x;
            // lower the bullet slightly. Will need to be sent from gun later on.
            bullet.mesh.position.y = vector.y;
            bullet.mesh.position.z = vector.z;
            scene.add(bullet.mesh);
            return bullet;
        }
        Combat.addBulletType = addBulletType;
    })(Combat = App.Combat || (App.Combat = {}));
})(App || (App = {}));
var App;
(function (App) {
    (function (GameDataType) {
        GameDataType[GameDataType["BULLET"] = 0] = "BULLET";
        GameDataType[GameDataType["POSITION"] = 1] = "POSITION";
    })(App.GameDataType || (App.GameDataType = {}));
    var GameDataType = App.GameDataType;
    var GameData = (function () {
        function GameData(type, data) {
            this.type = type;
            this.data = data;
        }
        return GameData;
    })();
    App.GameData = GameData;
})(App || (App = {}));
var App;
(function (App) {
    var Human = (function (_super) {
        __extends(Human, _super);
        function Human(name) {
            _super.call(this, name);
        }
        return Human;
    })(App.Player);
    App.Human = Human;
})(App || (App = {}));
var App;
(function (App) {
    App.Message = function (type, message) {
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
})(App || (App = {}));
var App;
(function (App) {
    var Player = (function () {
        function Player(name) {
            this.name = name;
            var me = this;
            this.energy = 100;
            this.health = 100;
            this.position = new THREE.Vector3();
            this.updatePosition = function (x, y, z) {
                me.position.x = x;
                me.position.y = y;
                me.position.z = z;
            };
        }
        return Player;
    })();
    App.Player = Player;
})(App || (App = {}));
var App;
(function (App) {
    var Combat;
    (function (Combat) {
        (function (WeaponType) {
            WeaponType[WeaponType["NORMAL"] = 0] = "NORMAL";
            WeaponType[WeaponType["AUTOMATIC"] = 1] = "AUTOMATIC";
        })(Combat.WeaponType || (Combat.WeaponType = {}));
        var WeaponType = Combat.WeaponType;
        (function (WeaponMode) {
            WeaponMode[WeaponMode["SEMI_AUTOMATIC"] = 0] = "SEMI_AUTOMATIC";
            WeaponMode[WeaponMode["AUTOMATIC"] = 1] = "AUTOMATIC";
        })(Combat.WeaponMode || (Combat.WeaponMode = {}));
        var WeaponMode = Combat.WeaponMode;
        function getAmmoType(weaponType) {
            switch (weaponType) {
                case 0 /* NORMAL */:
                case 1 /* AUTOMATIC */:
                default:
                    return 0 /* NORMAL */;
            }
        }
        function getWeaponMesh(weaponType, camera) {
            var weaponMesh;
            switch (weaponType) {
                case 1 /* AUTOMATIC */:
                case 0 /* NORMAL */:
                default:
                    var geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                    var material = new THREE.MeshBasicMaterial({ color: 0xbbbbbb });
                    weaponMesh = new THREE.Mesh(geometry, material);
            }
            return weaponMesh;
        }
        var WeaponSetting = (function () {
            function WeaponSetting(weaponMode) {
                this.weaponMode = weaponMode;
            }
            return WeaponSetting;
        })();
        function getWeaponSettings(weaponType) {
            switch (weaponType) {
                case 1 /* AUTOMATIC */:
                    return new WeaponSetting(1 /* AUTOMATIC */);
                case 0 /* NORMAL */:
                default:
                    return new WeaponSetting(0 /* SEMI_AUTOMATIC */);
            }
        }
        var Weapon = (function () {
            function Weapon(weaponType, weaponMesh, weaponSettings) {
                var self = this;
                this.weaponType = weaponType;
                this.ammoType = getAmmoType(weaponType);
                this.mesh = weaponMesh;
                this.settings = weaponSettings;
            }
            return Weapon;
        })();
        Combat.Weapon = Weapon;
        function addWeaponType(weaponType, scene, camera) {
            var bullet = new Weapon(weaponType, getWeaponMesh(weaponType, camera), getWeaponSettings(weaponType));
            camera.add(bullet.mesh);
            bullet.mesh.position.set(0.25, -0.15, -0.25);
            scene.add(camera);
            return bullet;
        }
        Combat.addWeaponType = addWeaponType;
        Combat.weapon = Combat.addWeaponType(0 /* NORMAL */, App.Display.scene, App.Display.camera);
    })(Combat = App.Combat || (App.Combat = {}));
})(App || (App = {}));
//# sourceMappingURL=@script.js.map