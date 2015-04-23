module App.Manager.Player {

    var players: Player[] = [];

    function addPlayer(player: Player) {
        players.push(player);
    }

    export function addHuman(human: Human) {
        addPlayer(human);
    }

    export function addAI(ai: AI) {
        addPlayer(ai);
    }

    export function addNewHuman(name: string){
        var human = new Human(name);
        addHuman(human);
    }

    export function addNewAI(name: string) {
        var ai = new AI(name);
        addAI(ai);
    }

    export function Do(x: (player: Player) => void) {
        for (var i = 0; i < players.length; i++) {
            x(players[i]);
        }
    }

    export function DoTo(x: (player: Player) => void, name: string) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].name == name) {
                x(players[i]);
            }
        }
    }

    export function AIDo(x: (player: Player) => void) {
        Do(function (currentPlayer) {
            if (currentPlayer instanceof AI) {
                x(currentPlayer);
            }
        });
    }

    export function HumanDo(x: (player: Player) => void) {
        Do(function (currentPlayer) {
            if (currentPlayer instanceof Human) {
                x(currentPlayer);
            }
        });
    }

    export function removeHuman(name: string) {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof Human) {
                if (players[i].name == name) {
                    players.splice(i, 1);
                }
            }
        }
    }

    export function removeAI(name: string) {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof AI) {
                if (players[i].name == name) {
                    players.splice(i, 1);
                }
            }
        }
    }

    export function getAIFromName(name: string) {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof AI) {
                if (players[i].name == name) {
                    return players[i];
                }
            }
        }
    }

    export function getHumanFromName(name: string) {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof Human) {
                if (players[i].name == name) {
                    return players[i];
                }
            }
        }
    }
}