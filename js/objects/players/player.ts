module App {

    export class Player implements ICollidable {

        energy: number;

        health: number;

        name: string;

        position: THREE.Vector3;

        updatePosition: (x: number, y: number, z: number) => void;

        weapon: App.Combat.Weapon;

        mesh: THREE.Mesh;

        constructor(name : string) {

            this.name = name;

            var me = this;

            this.energy = 100;
            this.health = 100;

            this.position = new THREE.Vector3();

            this.updatePosition = function (x: number, y: number, z: number) {
                me.position.x = x;
                me.position.y = y;
                me.position.z = z;
            }            
        }
    }

}