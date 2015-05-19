module App.Manager.Player {

    var players: Player[] = [];

    function addPlayer(player: Player): Player {
        players.push(player);

        return player;
    }

    export function addHuman(human: Human): Human {
        return <Human>addPlayer(human);
    }

    export function addAI(ai: AI): AI {
        return addPlayer(ai);
    }

    export function addNewHuman(name: string): Human{
        var human = new Human(name);
        return addHuman(human);
    }

    export function addNewAI(name: string): AI {
        var ai = new AI(name);
        return addAI(ai);
    }

    export function Do(x: (player: Player) => void): void {
        for (var i = 0; i < players.length; i++) {
            x(players[i]);
        }
    }

    export function DoTo(x: (player: Player) => void, name: string): void {
        for (var i = 0; i < players.length; i++) {
            if (players[i].name == name) {
                x(players[i]);
            }
        }
    }

    export function AIDo(x: (player: Player) => void): void {
        Do(function (currentPlayer) {
            if (currentPlayer instanceof AI) {
                x(currentPlayer);
            }
        });
    }

    export function HumanDo(x: (player: Player) => void): void {
        Do(function (currentPlayer) {
            if (currentPlayer instanceof Human) {
                x(currentPlayer);
            }
        });
    }

    export function removeHuman(name: string): Player[] {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof Human) {
                if (players[i].name == name) {
                    return players.splice(i, 1);
                }
            }
        }
        return [];
    }

    export function removeAI(name: string): Player[] {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof AI) {
                if (players[i].name == name) {
                    return players.splice(i, 1);
                }
            }
        }
        return [];
    }

    export function getAIFromName(name: string): Player {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof AI) {
                if (players[i].name == name) {
                    return players[i];
                }
            }
        }
    }

    export function getHumanFromName(name: string): Human {
        for (var i = 0; i < players.length; i++) {
            if (players[i] instanceof Human) {
                if (players[i].name == name) {
                    return <Human>players[i];
                }
            }
        }
    }
}