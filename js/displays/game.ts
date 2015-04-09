var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 500;
camera.position.y = 0.5;

var renderer = new THREE.WebGLRenderer({ alpha: true,  antialias: false  });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry( 1, 1, 1, 5, 5, 5 );
var material = new THREE.MeshBasicMaterial( {color: 0xffffff} ); 

var cube = new THREE.Mesh(geometry, material);
cube.translateY(0.5)
var egh = new THREE.EdgesHelper(cube, 0x000000 );

scene.add(cube);
scene.add(egh);

var geometry2 = new THREE.PlaneGeometry( 5, 20, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xbedcc8, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry2, material);
plane.rotation.x += Math.PI / 2;
scene.add( plane );

camera.position.z = 5;
renderer.render( scene, camera );

//var controls = new THREE.OrbitControls(camera);
//controls.addEventListener('change', render);
//controls.update();
function render() {
    cameraUpdate();
    renderer.render(scene, camera);
    window.requestAnimationFrame(render);
}
render();

function cameraUpdate() {
    var speed = 0.05;
    if(KEYSPRESSED.W){
        camera.translateZ(-speed);
    }
    if (KEYSPRESSED.S){
        camera.translateZ(speed);
    }
    if (KEYSPRESSED.A){
        camera.translateX(-speed);
    }
    if (KEYSPRESSED.D){
        camera.translateX(speed);
    }
}