module App.Control {

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
    export var fullRotationX = 0;
    export var fullRotationY = 0;
 
    export var zoom = false;
    function getScaleFactor(): number {
        return 100 * (zoom ? 32 : 1);
    }

    function moveCallback(e) {
        var scaleFactor = getScaleFactor();
        if (Math.abs(fullRotationX - e.movementY / scaleFactor) < (Math.PI / 2)) {
            App.Display.camera.rotateOnAxis(cameraXAxis, -e.movementY / scaleFactor);
            rotationYAxis.applyAxisAngle(cameraXAxis, e.movementY / scaleFactor);
            fullRotationX -= e.movementY / scaleFactor;
            fullRotationY -= e.movementX / scaleFactor;
        }
        App.Display.camera.rotateOnAxis(rotationYAxis, -e.movementX / scaleFactor);
    }

    function clickCallback(e) {
        // leftclick
        if (e.button == 0) {
            App.Display.fire();
        }
        // middleclick
        if (e.button == 1) {

        }
        // rightclick
        if (e.button == 2) {
            zoom = !zoom;
            App.Display.toggleZoom();
        }
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