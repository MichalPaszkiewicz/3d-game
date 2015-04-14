module App {
    export function serverChat(message) {
        App.Comms.sendToServer("chat", message);
        App.Display.log("me: " + message);
    }

    export function chat(message) {
        App.Comms.dataChannel.send(App.Comms.myID + ": " + message);
        App.Display.log("me: " + message);
    }

    // for use if all things are breaking.
    // export function log(text: string, colour?: string) {
    //    if (App.Display.log != null) {
    //        App.Display.log(text, colour);
    //    }
    //    else {
    //        if (colour == null) {
    //            colour = "black";
    //        }
    //        console.log("%c" + text, colour);
    //    }
    //}
}