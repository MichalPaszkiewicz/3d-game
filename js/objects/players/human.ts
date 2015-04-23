module App {

    export class Human extends Player {

        peerConnection: RTCPeerConnection;

        dataChannel: RTCDataChannel;

        constructor(name : string) {

            super(name);

        }
    }
} 