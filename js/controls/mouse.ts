module App.Control {
    import camera = App.Display.camera;
    import fire = App.Display.fire;

    var havePointerLock = "pointerLockElement" in document ||
        "mozPointerLockElement" in document ||
        "webkitPointerLockElement" in document;

    var element = document.body;

    element.requestPointerLock = element.requestPointerLock ||
    element.mozRequestPointerLock ||
    element.webkitRequestPointerLock;
    // ask the browser to lock the pointer
    element.onclick = function () {
        element.requestPointerLock();
    };
    // ask the browser to release the pointer
    document.exitPointerLock = document.exitPointerLock ||
    document.mozExitPointerLock ||
    document.webkitExitPointerLock;
    document.exitPointerLock();

    var cameraXAxis = new THREE.Vector3(1, 0, 0);
    var rotationYAxis = new THREE.Vector3(0, 1, 0);
    var fullRotationX = 0;

    function moveCallback(e) {
        if (Math.abs(fullRotationX - e.movementY / 100) < (Math.PI / 2)) {
            camera.rotateOnAxis(cameraXAxis, -e.movementY / 100);
            rotationYAxis.applyAxisAngle(cameraXAxis, e.movementY / 100);
            fullRotationX -= e.movementY / 100;
        }
        camera.rotateOnAxis(rotationYAxis, -e.movementX / 100);
    }

    function clickCallback() {
        fire();
    }

    function changeCallback(e) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
            // pointer was just locked
            // enable the mousemove listener
            document.addEventListener("mousemove", moveCallback, false);

            document.addEventListener("mousedown", clickCallback, false);
        } else {
            // pointer was just unlocked
            // disable the mousemove listener
            document.removeEventListener("mousemove", moveCallback, false);

            document.removeEventListener("mousedown", clickCallback, false);
        }
    }

    // hook pointer lock state change events
    document.addEventListener("pointerlockchange", changeCallback, false);
    document.addEventListener("mozpointerlockchange", changeCallback, false);
    document.addEventListener("webkitpointerlockchange", changeCallback, false);

    function errorCallback(e) {
        console.log(e);
    }

    document.addEventListener("pointerlockerror", errorCallback, false);
    document.addEventListener("mozpointerlockerror", errorCallback, false);
    document.addEventListener("webkitpointerlockerror", errorCallback, false);
}