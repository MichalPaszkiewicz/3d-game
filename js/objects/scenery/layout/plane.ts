module App.Scene.Layout {

    export class Plane extends SceneItem{


        constructor(size: THREE.Vector2, scene: THREE.Scene) {

            var geometry = new THREE.PlaneGeometry(size.x, size.y, 32);
            var material = new THREE.MeshBasicMaterial({ color: 0xbbffb1, side: THREE.DoubleSide });
            var plane = new THREE.Mesh(geometry, material);
            plane.rotation.x += Math.PI / 2;

            super(plane, scene);
        }
    }

}