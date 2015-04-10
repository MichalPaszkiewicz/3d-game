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

var geometry2 = new THREE.PlaneGeometry( 20, 20, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xbbffb1, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry2, material);
plane.rotation.x += Math.PI / 2;
scene.add( plane );

camera.position.z = 5;
renderer.render( scene, camera );

//var controls = new THREE.OrbitControls(camera);
//controls.addEventListener('change', render);
//controls.update();
function render() {
    if (KEYSPRESSED.C) {
        camera.position.y = 0.25;
    }
    else {
        camera.position.y = 0.5;
    }

    if (bullets != null) {
        updateAllBullets();
    }

    cameraUpdate();
    renderer.render(scene, camera);

    if (currentLog != null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentLog.drawLog();
        drawEnergyBar();
        drawHealthBar();
    }

    window.requestAnimationFrame(render);
}
render();

function speed() {
    if (KEYSPRESSED.C) {
        return 0.01;
    }

    if (KEYSPRESSED.SHIFT) {
        if (canRun()) {
            return 0.08;
        }
    }
    else {
        Rest();
    }

    return 0.03;
}

var health = 100;
var energy = 100;

function canRun() {
    if (energy > 0) {
        energy-=3;
        return true;
    }
    else {
        return false;
    }
}

function Rest() {
    if (energy < 100) {
        energy++;
    }
}

function cameraUpdate() {
    var currentSpeed = speed();
    if(KEYSPRESSED.W){
        camera.translateZ(-currentSpeed);
    }
    if (KEYSPRESSED.S){
        camera.translateZ(currentSpeed);
    }
    if (KEYSPRESSED.A){
        camera.translateX(-currentSpeed);
    }
    if (KEYSPRESSED.D){
        camera.translateX(currentSpeed);
    }
}

var bullets = [];
var bulletSpeed = 0.1;

var updateAllBullets = function () {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].updatePosition();
    }
}

var bullet = function  (mesh : THREE.Mesh) {
    this.mesh = mesh;
    var vector = new THREE.Vector3(0, 0, -1);
    vector.applyQuaternion(camera.quaternion);
    this.velocity = vector;
    this.updatePosition = function () {
        this.mesh.position.x += this.velocity.x * bulletSpeed;
        this.mesh.position.y += this.velocity.y * bulletSpeed;
        this.mesh.position.z += this.velocity.z * bulletSpeed;
    }
}

function fire() {
    var circleGeometry = new THREE.SphereGeometry(0.02);
    var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var tempBullet = new THREE.Mesh(circleGeometry, bulletMaterial);
    tempBullet.position.x = camera.position.x;
    tempBullet.position.y = camera.position.y;
    tempBullet.position.z = camera.position.z;
    bullets.push(new bullet(tempBullet));
    scene.add(tempBullet);
}