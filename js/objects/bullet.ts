module App.Combat {
    import camera = Display.camera;

    var bulletSpeed = 0.1;

    export enum BulletType {
        NORMAL
    }

    class BulletSetting {
        bulletSpeed: number;
        damage: number;

        constructor(speed: number, damage: number) {
            this.bulletSpeed = speed;
            this.damage = damage;
        }
    }

    function getBulletSettings(type: BulletType): BulletSetting {
        switch (type) {
            case BulletType.NORMAL:
            default:
                return new BulletSetting(0.1, 10);
        }
    }

    function getBulletMesh(type: BulletType, camera: THREE.Camera): THREE.Mesh {
        var bulletMesh: THREE.Mesh;

        switch (type) {
            case BulletType.NORMAL:
            default:
             var circleGeometry = new THREE.SphereGeometry(0.02);
             var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
             bulletMesh = new THREE.Mesh(circleGeometry, bulletMaterial);
        }

        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(App.Combat.weapon.mesh.matrixWorld);

        bulletMesh.position.x = vector.x;
        // lower the bullet slightly. Will need to be sent from gun later on.
        bulletMesh.position.y = vector.y;
        bulletMesh.position.z = vector.z;

        return bulletMesh;
    }

    class Bullet {
        type: BulletType;
        mesh: THREE.Mesh;
        age: number;
        settings: BulletSetting
        velocity: THREE.Vector3;
        updatePosition: () => void;
        constructor(ammoType: BulletType, mesh: THREE.Mesh, settings: BulletSetting) {
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
            };
        }
    }

    export function addBulletType(ammoType: BulletType, scene: THREE.Scene, camera: THREE.Camera){
        var bullet = new Bullet(ammoType, getBulletMesh(ammoType, camera), getBulletSettings(ammoType));
        scene.add(bullet.mesh);

        return bullet;
    }


}