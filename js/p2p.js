var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

var connection = {
    'optional':
        [{ 'DtlsSrtpKeyAgreement': true }, { 'RtpDataChannels': true }]
};

var peerConnection = new webkitRTCPeerConnection(config, connection);

peerConnection.onicecandidate = function (e) {
    if (!peerConnection || !e || !e.candidate) return;
    sendToServer("candidate", event.candidate);
}

var dataChannel = peerConnection.createDataChannel("datachannel", { reliable: false });

dataChannel.onmessage = function (e) { log("DC message:" + e.data); };
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

peerConnection.createOffer(function (sdp) {
    peerConnection.setLocalDescription(sdp);
    sendToServer("offer", sdp);
    log("------ SEND OFFER ------");
}, null, sdpConstraints);

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
        sendToServer("candidate", candidate);
    }

    dataChannel = peerConnection.createDataChannel(
        "datachannel", { reliable: false });

    dataChannel.onmessage = function (e) {
        log("DC from [" + user2 + "]:" + e.data);
    }
    dataChannel.onopen = function () {
        log("------ DATACHANNEL OPENED ------")
        //$("#sendform").show();
    };
    dataChannel.onclose = function () { log("------ DC closed! ------") };
    dataChannel.onerror = function () { log("DC ERROR!!!") };

    peerConnection.ondatachannel = function () {
        log('peerConnection.ondatachannel event fired.');
    };
}

peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

peerConnection.createAnswer(function (sdp) {
    peerConnection.setLocalDescription(sdp);
    sendToServer("answer", sdp);
    console.log("------ SEND ANSWER ------");
}, null, sdpConstraints);