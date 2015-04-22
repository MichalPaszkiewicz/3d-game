module App {
    export function serverChat(message) {
        App.Comms.sendToServer("chat", message);
        App.Display.log("me: " + message);
    }

    export function chat(text: string) {
        rtcSendOrKill("text",App.Comms.myID + ": " + text);
        logOrDefault("me: " + text, "black");
    }

    // for use if all things are breaking.
    function logOrDefault(text: string, colour?: string) {
        if (App.Display.log != null) {
            App.Display.log(text, colour);
        }
        else {
            if (colour == null) {
                colour = "black";
            }
            console.log("%c" + text, colour);
        }
    }

    export function rtcSendOrKill(msgType: string, data: string | Object) {
        if (App.Comms != null && App.Comms.dataChannel != null && App.Comms.dataChannel.send != null) {
            var message = Message(msgType, data);
            App.Comms.dataChannel.send(message.asString());
            return;
        }
        logOrDefault("MainTS: Error sending RTC msg", "orange");
    }

    export function sendGameDataOrKill(type: GameDataType, data) {
        if (App.Comms == null || App.Comms.dataChannel == null || App.Comms.dataChannel.send == null || App.Comms.dataChannel.readyState != "open") {
            logOrDefault("MainTS: DataChannel not yet set up", "orange");
            return;
        }

        var gameData = new GameData(type, data);
        var message = Message("game", gameData);
        
        App.Comms.dataChannel.send(message.asString());
    }
}