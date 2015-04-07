function serverChat(message) {
    sendToServer("chat", message);
    log("me: " + message);
}

function chat(message) {
    dataChannel.send(myID + ": " + message);
    log("me: " + message);
} 