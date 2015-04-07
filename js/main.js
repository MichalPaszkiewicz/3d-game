function serverChat(message) {
    sendToServer("chat", message);
    log("me: " + message);
}

