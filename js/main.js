function chat(message) {
    sendToServer("chat", message);
    log(message);
}