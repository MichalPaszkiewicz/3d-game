module App.Combat {
    import camera = Display.camera;

    var bulletSpeed = 0.1;

    export enum bulletType {
        NORMAL
    }

    class BulletSetting {
        bulletSpeed: number;
        damage: number;

        constructor(speed: number, damage: number) {
            this.bulletSpeed = speed;
        }
    }

    function getBulletSettings(type: bulletType): BulletSetting {
        switch (type) {
            case bulletType.NORMAL:
            default:
                return new BulletSetting(0.1, 10);
        }
    }

    function getBulletMesh(type: bulletType, camera: THREE.Camera): THREE.Mesh {
        var bulletMesh: THREE.Mesh;

        switch (type) {
            case bulletType.NORMAL:
            default:
             var circleGeometry = new THREE.SphereGeometry(0.02);
             var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
             bulletMesh = new THREE.Mesh(circleGeometry, bulletMaterial);
        }

        bulletMesh.position.x = camera.position.x;
        // lower the bullet slightly. Will need to be sent from gun later on.
        bulletMesh.position.y = camera.position.y - 0.05;
        bulletMesh.position.z = camera.position.z;

        return bulletMesh;
    }

    class Bullet {
        mesh: THREE.Mesh;
        age: number;
        settings: BulletSetting
        velocity: THREE.Vector3;
        updatePosition: () => void;
        constructor(mesh: THREE.Mesh, ammoType: bulletType, settings: BulletSetting) {
            this.mesh = mesh;
            this.age = 0;
            this.settings = settings;
            var vector = new THREE.Vector3(0, 0, -1);
            vector.applyQuaternion(camera.quaternion);
            this.velocity = vector;
            this.updatePosition = function () {
                this.mesh.position.x += this.velocity.x * bulletSpeed;
                this.mesh.position.y += this.velocity.y * bulletSpeed;
                this.mesh.position.z += this.velocity.z * bulletSpeed;
            };
        }
    }

    export function addBulletType(ammoType: bulletType, scene: THREE.Scene, camera: THREE.Camera){
        var bulletMesh = getBulletMesh(ammoType, camera);
        var bullet = new Bullet(bulletMesh, ammoType, getBulletSettings(ammoType));
        scene.add(bullet.mesh);

        return bullet;
    }


}