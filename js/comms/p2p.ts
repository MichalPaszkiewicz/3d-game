﻿var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

var connection = {
    'optional':
    [{ 'DtlsSrtpKeyAgreement': true }, { 'RtpDataChannels': true }]
};

var peerConnection = new webkitRTCPeerConnection(config, connection);

peerConnection.onicecandidate = function (e) {
    if (!peerConnection || !e || !e.candidate) return;
    sendToServer("candidate", { candidate: e.candidate });
}

var dataChannel = peerConnection.createDataChannel("datachannel", { reliable: false });

dataChannel.onmessage = function (e) { log("(webRTC) " + e.data); };
dataChannel.onopen = function () { log("------ DATACHANNEL OPENED ------"); };
dataChannel.onclose = function () { log("------- DC closed! -------") };
dataChannel.onerror = function () { log("DC ERROR!!!") };

var sdpConstraints : RTCOptionalMediaConstraint = {
    'mandatory':
    {
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

function processIce(iceCandidate : RTCIceCandidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate), function () { }, function(){});
}

function processAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    log("------ PROCESSED ANSWER ------");
};

function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));

    peerConnection.createAnswer(function (sdp) {
        peerConnection.setLocalDescription(sdp);
        sendToServer("answer", { to: offer.from, from: myID, answer: sdp });
        log("------ SENT ANSWER ------");
    }, null, sdpConstraints);
}