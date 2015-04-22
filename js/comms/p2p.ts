/// <reference path="../displays/logger.ts" />
module App.Comms {
    import log = Display.log;

    export var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

    export var connection = {
        "optional":
        [{ "DtlsSrtpKeyAgreement": true }, { "RtpDataChannels": true }]
    };
    
    export var peerConnection = new webkitRTCPeerConnection(config, connection);

    // attach all necessary functions to peerConnection.
    export function attachRTCConnectionFunctions(connection: RTCPeerConnection) {
        connection.onicecandidate = function (e) {
            if (!connection || !e || !e.candidate) { return; }
            sendToServer("candidate", { candidate: e.candidate });
        }
    }

    attachRTCConnectionFunctions(peerConnection);

    export var dataChannel = peerConnection.createDataChannel("datachannel", { reliable: false });

    // attach all necessary functions to dataChannel
    export function attachRTCDataChannelFunctions(channel: RTCDataChannel) {
        channel.onmessage = function (e: any) {
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
                        App.Display.processGameData(dataJSON.message);
                        break;
                    default:
                        log(dataJSON);
                }
            }
            else {
                log("Received erroneous message from websocket", "red");
            }
        };

        channel.onopen = function () { log("------ DATACHANNEL OPENED ------"); };
        channel.onclose = function () { log("------- DC closed! -------"); };
        channel.onerror = function () { log("DC ERROR!!!"); };
    }

    attachRTCDataChannelFunctions(dataChannel);

    export var sdpConstraints: RTCOptionalMediaConstraint = {
        "mandatory":
        {
            "OfferToReceiveAudio": false,
            "OfferToReceiveVideo": false
        }
    };

    export function sendOffer() {
        "use strict";
        peerConnection.createOffer(function (sdp: any) {
            peerConnection.setLocalDescription(sdp);
            sendToServer("offer", { from: myID, offer: sdp });
            log("------ SENT OFFER ------");
        }, null, sdpConstraints);
    }

    export function processIce(iceCandidate: RTCIceCandidate) {
        "use strict";
        peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate), function () {
            // todo: do something in here
        }, function () {
                // todo: do something in here
            });
    }

    export function processAnswer(answer) {
        "use strict";
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        log("------ PROCESSED ANSWER ------");
    };

    export function handleOffer(offer: any) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));

        peerConnection.createAnswer(function (sdp) {
            peerConnection.setLocalDescription(sdp);
            sendToServer("answer", { to: offer.from, from: myID, answer: sdp });
            log("------ SENT ANSWER ------");
        }, null, sdpConstraints);
    }
}
