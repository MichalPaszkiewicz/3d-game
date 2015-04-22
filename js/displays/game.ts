module App.Display {
    import KEYSPRESSED = Control.KEYSPRESSED;

    export var scene = new THREE.Scene();

    export var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;
    camera.position.y = 0.75;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    var geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    var cube = new THREE.Mesh(geometry, material);
    cube.translateY(0.5);
    var egh = new THREE.EdgesHelper(cube, 0x000000);

    scene.add(cube);
    scene.add(egh);

    var geometry2 = new THREE.PlaneGeometry(20, 20, 32);
    var material2 = new THREE.MeshBasicMaterial({ color: 0xbbffb1, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geometry2, material2);
    plane.rotation.x += Math.PI / 2;
    scene.add(plane);

    camera.position.z = 5;
    renderer.render(scene, camera);



    // var controls = new THREE.OrbitControls(camera);
    // controls.addEventListener('change', render);
    // controls.update();
    function render() {
        if (KEYSPRESSED.C) {
            camera.position.y = 0.25;
        }
        else {
            camera.position.y = 0.75;
        }

        if (bullets != null && updateAllBullets != null) {
            updateAllBullets();
        }

        cameraUpdate();

        renderer.render(scene, camera);

        if (currentLog != null && canvasNeedsUpdate) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            currentLog.drawLog();
            drawEnergyBar();
            drawHealthBar();
            drawCrossHair();
            canvasNeedsUpdate = false;
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

    function canRun() {
        if (App.ME.energy > 0) {
            App.ME.energy -= 3;
            canvasNeedsUpdate = true;
            return true;
        }
        else {
            return false;
        }
    }

    function Rest() {
        if (App.ME.energy < 100) {
            App.ME.energy++;
            canvasNeedsUpdate = true;
        }
    }

    function cameraUpdate() {
        var currentSpeed = speed();
        if (KEYSPRESSED.W) {
            camera.translateZ(-currentSpeed);
        }
        if (KEYSPRESSED.S) {
            camera.translateZ(currentSpeed);
        }
        if (KEYSPRESSED.A) {
            camera.translateX(-currentSpeed);
        }
        if (KEYSPRESSED.D) {
            camera.translateX(currentSpeed);
        }
    }

    function sendThePosition() {
        if (sendGameDataOrKill != null && GameDataType != null && App.Comms != null && App.Comms.dataChannel.readyState == "open") {
            try {
                sendGameDataOrKill(GameDataType.POSITION, {
                    x: camera.position.x,
                    z: camera.position.z,
                    d: App.Control.fullRotationY
                });
            }
            catch (e) {
                log(e.message, "orange");
            }
            setTimeout(sendThePosition, 50);
        }
        else {
            setTimeout(sendThePosition, 500);
        }
    }
    sendThePosition();

    export var bullets = [];

    var updateAllBullets = function () {
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].updatePosition();
        }

        var newBullets = [];
        for (var i = 0; i < bullets.length; i++) {
            if (bullets[i].age >= bullets[i].settings.lifeSpan) {
                scene.remove(bullets[i].mesh);
            }
            else {
                newBullets.push(bullets[i]);
            }
        }

        bullets = newBullets;
    };

    export function addBullet(bullet) {
        bullets.push(bullet);
    }

    export function fire() {
        var tempBullet = App.Combat.addBulletType(App.Combat.BulletType.NORMAL, scene, camera, !App.Control.zoom);
        addBullet(tempBullet);
        sendGameDataOrKill(GameDataType.BULLET, {
            type: tempBullet.type,
            settings: tempBullet.settings,
            position: tempBullet.mesh.position,
            velocity: tempBullet.velocity
        });

        if (App.Control.zoom) {
            App.Control.zoom = !App.Control.zoom;
            toggleZoom();
        }
    }

    export function toggleZoom(){
        if (App.Control.zoom) {
            camera.fov /= 16;
            App.Display.currentCrossHair = App.Display.crossHairType.SNIPER_ZOOM;
        }
        else {
            camera.fov *= 16;
            App.Display.currentCrossHair = App.Display.crossHairType.STANDARD;
        }
        canvasNeedsUpdate = true;
        camera.updateProjectionMatrix();
    }

    export var otherPerson: THREE.Object3D;

    function drawPerson() {
        var loader = new THREE.ObjectLoader();
        loader.load("js/models/baymax.json", function (obj) {
            obj.scale.x = 0.01;
            obj.scale.y = 0.01;
            obj.scale.z = 0.01;
            obj.translateX(2);
            obj.translateY(0.75);

            otherPerson = obj;

            scene.add(obj);
        });
    }

    export function handleMovement(pos) {
        otherPerson.position.x = pos.x;
        otherPerson.position.z = pos.z;
        otherPerson.rotation.y = pos.d + Math.PI;
    }

    drawPerson();

    var light = new THREE.PointLight(0xff0000, 1, 100);
    light.position.set(5, 5, 1);
    scene.add(light);

    export var weapon = Combat.addWeaponType(App.Combat.WeaponType.NORMAL, App.Display.scene, App.Display.camera);

    export function processGameData(data: IGameData) {
        switch (data.type) {
            case GameDataType.BULLET:
                var bullet = new App.Combat.ImportBullet(data.data["type"], data.data["settings"], App.Display.camera);
                bullet.mesh.position.x = data.data["position"].x;
                bullet.mesh.position.y = data.data["position"].y;
                bullet.mesh.position.z = data.data["position"].z;
                bullet.velocity = data.data["velocity"];
                App.Display.addBullet(bullet);
                App.Display.scene.add(bullet.mesh);
                return;
            case GameDataType.POSITION:
                App.Display.handleMovement(data.data);
                return;
            default:
                log("Error with processing game data", "orange");
                return;
        }
    }
}