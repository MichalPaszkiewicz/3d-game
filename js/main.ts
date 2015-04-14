module App {
    export function serverChat(message) {
        App.Comms.sendToServer("chat", message);
        App.Display.log("me: " + message);
    }

    export function chat(message) {
        App.Comms.dataChannel.send(App.Comms.myID + ": " + message);
        App.Display.log("me: " + message);
    }
}