module App {

    export class Player implements ICollidable {

        energy: number;

        health: number;

        name: string;

        updatePosition: (x: number, y: number, z: number) => void;

        weapon: App.Combat.Weapon;

        object3d: THREE.Object3D;

        weapons: App.Combat.Weapon[];

        currentWeapon: number;

        addWeapon: (weaponType: App.Combat.WeaponType) => void;

        setWeapon: (weaponType: App.Combat.WeaponType, scene: THREE.Scene) => void;

        weaponDown: (scene: THREE.Scene) => void;

        weaponUp: (scene: THREE.Scene) => void;

        constructor(name : string) {

            this.name = name;

            var me = this;

            this.energy = 100;
            this.health = 100;

            this.updatePosition = function (x: number, y: number, z: number) {
                me.object3d.position.x = x;
                me.object3d.position.y = y;
                me.object3d.position.z = z;
            }

            this.addWeapon = function (weaponType: App.Combat.WeaponType) {

                for (var i = 0; i < me.weapons.length; i++) {
                    if (me.weapons[i].weaponType == weaponType) {
                        // todo: add weapon ammo or such

                        return;
                    }
                }

                var newWeapon = App.Combat.createWeaponType(weaponType);
                me.weapons.push(newWeapon);
            }

            this.setWeapon = function (index: number, scene: THREE.Scene) {
                
                //check validity of index
                if (index < 0 || Math.abs(index) != index || index >= me.weapons.length) {
                    throw new Error("The index of the weapon you are trying to set is incorrect");
                    return;
                }

                if (me.currentWeapon != null) {
                    me.object3d.remove(me.weapons[me.currentWeapon].mesh)
                    scene.remove(me.weapons[me.currentWeapon].mesh);
                }

                me.object3d.add(me.weapons[index].mesh);
                scene.add(me.weapons[index].mesh);
                me.currentWeapon = index;
            }

            this.weaponDown = function (scene: THREE.Scene) {
                me.setWeapon((me.currentWeapon + 1) % me.weapons.length, scene);
            }

            this.weaponUp = function (scene: THREE.Scene) {
                me.setWeapon((me.currentWeapon - 1 + me.weapons.length) % me.weapons.length, scene);
            }
        }
    }

}