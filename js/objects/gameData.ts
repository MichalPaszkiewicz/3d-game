module App {

    export interface IGameData {
        type: GameDataType;
        data: Object;
    }

    export enum GameDataType {
        BULLET,
        POSITION
    }

    export class GameData implements IGameData {
        type: GameDataType;
        data: Object;
        constructor(type: GameDataType, data: Object) {
            this.type = type;
            this.data = data;
        }
    }
}