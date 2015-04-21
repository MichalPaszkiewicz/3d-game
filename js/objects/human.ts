module App {

    export class Human extends Player {

        peerConnection: RTCPeerConnection;

        constructor(name : string) {

            super(name);

        }
    }
} 