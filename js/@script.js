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
            log("(webRTC) " + e.data);
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
        var camera = App.Display.camera;
        var fire = App.Display.fire;
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
        var fullRotationX = 0;
        function moveCallback(e) {
            if (Math.abs(fullRotationX - e.movementY / 100) < (Math.PI / 2)) {
                camera.rotateOnAxis(cameraXAxis, -e.movementY / 100);
                rotationYAxis.applyAxisAngle(cameraXAxis, e.movementY / 100);
                fullRotationX -= e.movementY / 100;
            }
            camera.rotateOnAxis(rotationYAxis, -e.movementX / 100);
        }
        function clickCallback() {
            fire();
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
    var Display;
    (function (Display) {
        var health = App.ME.health;
        var energy = App.ME.energy;
        function drawEnergyBar() {
            if (energy != null) {
                App.ctx.beginPath();
                App.ctx.fillStyle = "blue";
                App.ctx.fillRect(App.canvas.width - 110, App.canvas.height - 20, energy, 10);
                App.ctx.strokeRect(App.canvas.width - 110, App.canvas.height - 20, 100, 10);
            }
        }
        Display.drawEnergyBar = drawEnergyBar;
        function drawHealthBar() {
            if (health != null) {
                App.ctx.beginPath();
                App.ctx.fillStyle = "red";
                App.ctx.fillRect(App.canvas.width - 110, App.canvas.height - 35, health, 10);
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
        Display.crossHairType = {
            "standard": 0,
            "sniper": 1
        };
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
            }
        ];
        var currentCrossHair = Display.crossHairType.standard;
        function drawCrossHair() {
            crossHairs[currentCrossHair].draw();
        }
        Display.drawCrossHair = drawCrossHair;
    })(Display = App.Display || (App.Display = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Display;
    (function (Display) {
        var KEYSPRESSED = App.Control.KEYSPRESSED;
        var scene = new THREE.Scene();
        Display.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        Display.camera.position.z = 500;
        Display.camera.position.y = 0.5;
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
        var geometry2 = new THREE.PlaneGeometry(20, 20, 32);
        var material2 = new THREE.MeshBasicMaterial({ color: 0xbbffb1, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry2, material2);
        plane.rotation.x += Math.PI / 2;
        scene.add(plane);
        Display.camera.position.z = 5;
        renderer.render(scene, Display.camera);
        // var controls = new THREE.OrbitControls(camera);
        // controls.addEventListener('change', render);
        // controls.update();
        function render() {
            if (KEYSPRESSED.C) {
                Display.camera.position.y = 0.25;
            }
            else {
                Display.camera.position.y = 0.5;
            }
            if (bullets != null) {
                updateAllBullets();
            }
            cameraUpdate();
            renderer.render(scene, Display.camera);
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
        var bullets = [];
        var updateAllBullets = function () {
            for (var i = 0; i < bullets.length; i++) {
                bullets[i].updatePosition();
            }
        };
        function fire() {
            var circleGeometry = new THREE.SphereGeometry(0.02);
            var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            var tempBullet = new THREE.Mesh(circleGeometry, bulletMaterial);
            tempBullet.position.x = Display.camera.position.x;
            // lower the bullet slightly. Will need to be sent from gun later on.
            tempBullet.position.y = Display.camera.position.y - 0.05;
            tempBullet.position.z = Display.camera.position.z;
            bullets.push(new App.Combat.bullet(tempBullet));
            scene.add(tempBullet);
        }
        Display.fire = fire;
        function drawPerson() {
            var loader = new THREE.ObjectLoader();
            loader.load("js/models/baymax.json", function (obj) {
                obj.scale.x = 0.01;
                obj.scale.y = 0.01;
                obj.scale.z = 0.01;
                obj.translateX(2);
                obj.translateY(1);
                scene.add(obj);
            });
        }
        drawPerson();
        var light = new THREE.PointLight(0xff0000, 1, 100);
        light.position.set(5, 5, 1);
        scene.add(light);
    })(Display = App.Display || (App.Display = {}));
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
                self.logs.push({ text: text, colour: colour });
            };
            self.drawLog = function () {
                var cutoff = 0;
                if (10 * self.logs.length + 10 > self.height) {
                    cutoff = 10 * self.logs.length + 10 - self.height;
                }
                for (var i = 0; i < self.logs.length; i++) {
                    App.ctx.fillStyle = self.logs[i].colour;
                    App.ctx.fillText(self.logs[i].text, 10, 10 * i + 10 - cutoff);
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
var App;
(function (App) {
    function serverChat(message) {
        App.Comms.sendToServer("chat", message);
        App.Display.log("me: " + message);
    }
    App.serverChat = serverChat;
    function chat(message) {
        App.Comms.dataChannel.send(App.Comms.myID + ": " + message);
        App.Display.log("me: " + message);
    }
    App.chat = chat;
})(App || (App = {}));
var App;
(function (App) {
    var Combat;
    (function (Combat) {
        var camera = App.Display.camera;
        var bulletSpeed = 0.1;
        (function (bulletType) {
            bulletType[bulletType["NORMAL"] = 0] = "NORMAL";
        })(Combat.bulletType || (Combat.bulletType = {}));
        var bulletType = Combat.bulletType;
        function addBulletType(ammoType) {
        }
        Combat.addBulletType = addBulletType;
        function bullet(mesh) {
            this.mesh = mesh;
            this.age = 0;
            var vector = new THREE.Vector3(0, 0, -1);
            vector.applyQuaternion(camera.quaternion);
            this.velocity = vector;
            this.updatePosition = function () {
                this.mesh.position.x += this.velocity.x * bulletSpeed;
                this.mesh.position.y += this.velocity.y * bulletSpeed;
                this.mesh.position.z += this.velocity.z * bulletSpeed;
            };
        }
        Combat.bullet = bullet;
    })(Combat = App.Combat || (App.Combat = {}));
})(App || (App = {}));
var App;
(function (App) {
    var ME;
    (function (ME) {
        ME.energy = 100;
        ME.health = 100;
    })(ME = App.ME || (App.ME = {}));
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
    var Combat;
    (function (Combat) {
        var Weapon = (function () {
            function Weapon() {
            }
            return Weapon;
        })();
        Combat.Weapon = Weapon;
    })(Combat = App.Combat || (App.Combat = {}));
})(App || (App = {}));
//# sourceMappingURL=@script.js.map