var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

var connection = {
    'optional':
        [{ 'DtlsSrtpKeyAgreement': true }, { 'RtpDataChannels': true }]
};

var peerConnection = new webkitRTCPeerConnection(config, connection);

peerConnection.onicecandidate = function (e) {
    if (!peerConnection || !e || !e.candidate) return;
    sendToServer("candidate", { candidate: event.candidate });
}

var dataChannel = peerConnection.createDataChannel("datachannel", { reliable: false });

dataChannel.onmessage = function (e) { log("webRTC: " + e.data); };
dataChannel.onopen = function () { log("------ DATACHANNEL OPENED ------"); };
dataChannel.onclose = function () { log("------- DC closed! -------") };
dataChannel.onerror = function () { log("DC ERROR!!!") };

var sdpConstraints = {
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

function processIce(iceCandidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
}

function processAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    log("------ PROCESSED ANSWER ------");
};

function openDataChannel() {
    var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
    var connection = { 'optional': [{ 'DtlsSrtpKeyAgreement': true }, { 'RtpDataChannels': true }] };

    peerConnection = new webkitRTCPeerConnection(config, connection);
    peerConnection.onicecandidate = function (e) {
        if (!peerConnection || !e || !e.candidate) return;
        var candidate = event.candidate;
        sendToServer("candidate", { candidate: candidate });
    }

    dataChannel = peerConnection.createDataChannel(
        "datachannel", { reliable: false });

    dataChannel.onmessage = function (e) {
        log("DC from [" + user2 + "]:" + e.data);
    }
    dataChannel.onopen = function () {
        log("------ DATACHANNEL OPENED ------")
    };
    dataChannel.onclose = function () { log("------ DC closed! ------") };
    dataChannel.onerror = function () { log("DC ERROR!!!") };

    peerConnection.ondatachannel = function () {
        log('peerConnection.ondatachannel event fired.');
    };
}

function handleOffer(offer){
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));

    peerConnection.createAnswer(function (sdp) {
        peerConnection.setLocalDescription(sdp);
        sendToServer("answer", {to: offer.from, from: myID, answer:sdp});
        log("------ SENT ANSWER ------");
    }, null, sdpConstraints);
}
