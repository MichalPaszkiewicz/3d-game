window.onkeydown = function (e) {
    switch (e.keyCode) {
        // w
        case 87:
            camera.translateZ(-0.1)
            break;
        // a
        case 65:
            camera.translateX(-0.1)
            break;
        // s
        case 83:
            camera.translateZ(0.1)
            break;
        // d
        case 68:
            camera.translateX(0.1)
            break;
        default:
            console.log(e.keyCode);
    }
}