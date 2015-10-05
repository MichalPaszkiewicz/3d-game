module App.Scene {

    export class SceneItem implements ICollidable {

        object3d: THREE.Object3D;

        constructor(mesh: THREE.Mesh, scene: THREE.Scene) {
            this.object3d = mesh;
            scene.add(this.object3d);
        }

    }

}