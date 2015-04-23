module App.Combat {
    export enum BulletType {
        NORMAL,
        FAST
    }

    class BulletSetting {
        bulletSpeed: number;
        damage: number;
        lifeSpan: number;
        colour: string;

        constructor(speed: number, damage: number, lifeSpan: number) {
            this.bulletSpeed = speed;
            this.damage = damage;
            this.lifeSpan = lifeSpan;
            this.colour = "red";
        }
    }

    function getBulletSettings(type: BulletType): BulletSetting {
        switch (type) {
            case BulletType.FAST:
                return new BulletSetting(0.5, 10, 1000);
            case BulletType.NORMAL:
            default:
                return new BulletSetting(0.1, 10, 1000);
        }
    }

    function getBulletMesh(type: BulletType): THREE.Mesh {
        var bulletMesh: THREE.Mesh;

        switch (type) {
            case BulletType.NORMAL:
            default:
             var circleGeometry = new THREE.SphereGeometry(0.02);
             var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
             bulletMesh = new THREE.Mesh(circleGeometry, bulletMaterial);
        }

        return bulletMesh;
    }

    export class Bullet {
        type: BulletType;
        mesh: THREE.Mesh;
        age: number;
        settings: BulletSetting
        velocity: THREE.Vector3;
        updatePosition: () => void;
        constructor(ammoType: BulletType, mesh: THREE.Mesh, settings: BulletSetting, camera: THREE.Camera) {
            this.type = ammoType;
            this.mesh = mesh;
            this.age = 0;
            this.settings = settings;
            var vector = new THREE.Vector3(0, 0, -1);
            vector.applyQuaternion(camera.quaternion);
            this.velocity = vector;
            this.updatePosition = function () {
                this.mesh.position.x += this.velocity.x * this.settings.bulletSpeed;
                this.mesh.position.y += this.velocity.y * this.settings.bulletSpeed;
                this.mesh.position.z += this.velocity.z * this.settings.bulletSpeed;
                this.age++;
            };
        }
    }

    export class ImportBullet extends Bullet {
        constructor(ammoType: BulletType, settings: BulletSetting, camera: THREE.Camera) {
            var mesh = getBulletMesh(ammoType);
            super(ammoType, mesh, settings, camera);
            this.updatePosition = function () {
                this.mesh.position.x += this.velocity.x * this.settings.bulletSpeed;
                this.mesh.position.y += this.velocity.y * this.settings.bulletSpeed;
                this.mesh.position.z += this.velocity.z * this.settings.bulletSpeed;
                this.age++;
            };
        }
    }

    export function addBulletType(ammoType: BulletType, scene: THREE.Scene, camera: THREE.Camera, fromWeapon: boolean): Bullet{
        var bullet = new Bullet(ammoType, getBulletMesh(ammoType), getBulletSettings(ammoType), camera);

        var vector = new THREE.Vector3();
        if (fromWeapon) {
            vector.setFromMatrixPosition(App.Display.weapon.mesh.matrixWorld);
            addBulletSpread(bullet);            
        }
        else {
            vector.setFromMatrixPosition(App.Display.camera.matrixWorld);
        }

        bullet.mesh.position.x = vector.x;
        // lower the bullet slightly. Will need to be sent from gun later on.
        bullet.mesh.position.y = vector.y;
        bullet.mesh.position.z = vector.z;

        scene.add(bullet.mesh);

        return bullet;
    }

    function addBulletSpread(bullet: Bullet) {
        var spread = 0.1;
        var spreadDistanceX = (Math.random() - 0.5) * spread;
        var spreadDistanceY = (Math.random() - 0.5) * spread;

        bullet.velocity.applyAxisAngle(new THREE.Vector3(1, 0, 0), spreadDistanceX + 0.05);
        bullet.velocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadDistanceY + 0.05);
    }
}