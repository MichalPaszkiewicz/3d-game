module App.Scene {

    export class SceneItem implements ICollidable {

        mesh: THREE.Mesh;

        constructor(mesh: THREE.Mesh, scene: THREE.Scene) {
            this.mesh = mesh;
            scene.add(this.mesh);
        }

    }

}