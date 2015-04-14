module App.Combat {
    import camera = Display.camera;

    var bulletSpeed = 0.1;

    export enum bulletType {
        NORMAL
    }

    export function addBulletType(ammoType: bulletType) {

    }

    export function bullet(mesh: THREE.Mesh) {
        this.mesh = mesh;
        this.age = 0;
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