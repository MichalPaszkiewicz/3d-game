var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 500;

var renderer = new THREE.WebGLRenderer({ alpha: true,  antialias: false  });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry( 1, 1, 1, 5, 5, 5 );
var material = new THREE.MeshBasicMaterial( {color: 0xffffff} ); 

var cube = new THREE.Mesh(geometry, material);
var egh = new THREE.EdgesHelper(cube, 0x000000 );
//egh.material.linewidth = 5;

scene.add(cube);
scene.add(egh);

var geometry2 = new THREE.PlaneGeometry( 5, 20, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry2, material);
plane.rotation.x += Math.PI/2 + 0.01
scene.add( plane );

camera.position.z = 5;
renderer.render( scene, camera );

var controls = new THREE.OrbitControls(camera);
controls.addEventListener('change', render);
controls.update();
function render() {
	renderer.render( scene, camera );
}
