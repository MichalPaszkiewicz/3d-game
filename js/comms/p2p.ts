var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

var connection = {
    'optional':
    [{ 'DtlsSrtpKeyAgreement': true }, { 'RtpDataChannels': true }]
};

var peerConnection = new webkitRTCPeerConnection(config, connection);

peerConnection.onicecandidate = function (e) {
    if (!peerConnection || !e || !e.candidate) return;
    sendToServer("candidate", { candidate: e.candidate });
};

var dataChannel = peerConnection.createDataChannel("datachannel", { reliable: false });

dataChannel.onmessage = function (e : any) { log("(webRTC) " + e.data); };
dataChannel.onopen = function () { log("------ DATACHANNEL OPENED ------"); };
dataChannel.onclose = function () { log("------- DC closed! -------"); };
dataChannel.onerror = function () { log("DC ERROR!!!"); };

var sdpConstraints : RTCOptionalMediaConstraint = {
    'mandatory':
    {
        'OfferToReceiveAudio': false,
        'OfferToReceiveVideo': false
    }
};

function sendOffer() {
    "use strict";
    peerConnection.createOffer(function (sdp : any) {
        peerConnection.setLocalDescription(sdp);
        sendToServer("offer", { from: myID, offer: sdp });
        log("------ SENT OFFER ------");
    }, null, sdpConstraints);
}

function processIce(iceCandidate: RTCIceCandidate) {
    "use strict";
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate), function () {
        //todo: do something in here
    }, function () {
        //todo: do something in here
    });
}

function processAnswer(answer) {
    "use strict";
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    log("------ PROCESSED ANSWER ------");
};

function handleOffer(offer : any) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));

    peerConnection.createAnswer(function (sdp) {
        peerConnection.setLocalDescription(sdp);
        sendToServer("answer", { to: offer.from, from: myID, answer: sdp });
        log("------ SENT ANSWER ------");
    }, null, sdpConstraints);
}
