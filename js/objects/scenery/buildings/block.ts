module App.Scene.Building {

    export class Block extends Building{
        
        constructor(scene: THREE.Scene, position: THREE.Vector3) {

            var geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
            var material = new THREE.MeshBasicMaterial({ color: 0xffffff });

            var cube = new THREE.Mesh(geometry, material);

            cube.translateX(position.x);
            cube.translateY(position.y);
            cube.translateZ(position.z);

            super(cube, scene);

            var egh = new THREE.EdgesHelper(cube, 0x000000);
            scene.add(egh);
        }
    }

} 