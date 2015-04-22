/// <reference path="../displays/logger.ts" />
module App.Comms {
    import log = Display.log;

    export var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

    export var connectionOptions = {
        "optional":
        [{ "DtlsSrtpKeyAgreement": true }, { "RtpDataChannels": true }]
    };
    
    export function createPeerConnection(): RTCPeerConnection {
        return new webkitRTCPeerConnection(config, connectionOptions);
    }

    // attach all necessary functions to peerConnection.
    export function attachRTCConnectionFunctions(connexion: RTCPeerConnection){
        connexion.onicecandidate = function (e) {
            if (!connexion || !e || !e.candidate) { return; }
            sendToServer("candidate", { candidate: e.candidate });
        }
    }

    export function createDataChannel(connexion: RTCPeerConnection): RTCDataChannel {
        return connexion.createDataChannel("datachannel", { reliable: false });
    }

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

    export var peerConnection = createPeerConnection()
    attachRTCConnectionFunctions(peerConnection);
    export var dataChannel = createDataChannel(peerConnection);
    attachRTCDataChannelFunctions(dataChannel);

    export var sdpConstraints: RTCOptionalMediaConstraint = {
        "mandatory":
        {
            "OfferToReceiveAudio": false,
            "OfferToReceiveVideo": false
        }
    };

    export function sendOffer(connexion: RTCPeerConnection) {
        "use strict";
        connexion.createOffer(function (sdp: any) {
            connexion.setLocalDescription(sdp);
            sendToServer("offer", { from: myID, offer: sdp });
            log("------ SENT OFFER ------");
        }, null, sdpConstraints);
    }

    export function processIce(connexion: RTCPeerConnection, iceCandidate: RTCIceCandidate) {
        "use strict";
        connexion.addIceCandidate(new RTCIceCandidate(iceCandidate), function () {
            // todo: do something in here
        }, function () {
                // todo: do something in here
            });
    }

    export function processAnswer(connexion: RTCPeerConnection, answer) {
        "use strict";
        connexion.setRemoteDescription(new RTCSessionDescription(answer));
        log("------ PROCESSED ANSWER ------");
    };

    export function handleOffer(connexion: RTCPeerConnection, offer: any) {
        connexion.setRemoteDescription(new RTCSessionDescription(offer.offer));

        connexion.createAnswer(function (sdp) {
            connexion.setLocalDescription(sdp);
            sendToServer("answer", { to: offer.from, from: myID, answer: sdp });
            log("------ SENT ANSWER ------");
        }, null, sdpConstraints);
    }
}
