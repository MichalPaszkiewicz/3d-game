var KEYSPRESSED = {
    W: false,
    A: false,
    S: false,
    D: false,
    C: false,
    SHIFT: false
};

window.onkeydown = function (e) {
    switch (e.keyCode) {
        // w
        case 87:
            KEYSPRESSED.W = true;
            break;
        // a
        case 65:
            KEYSPRESSED.A = true;
            break;
        // s
        case 83:
            KEYSPRESSED.S = true;
            break;
        // d
        case 68:
            KEYSPRESSED.D = true;
            break;
        // ctrl
        case 67:
            KEYSPRESSED.C = true;
            break;
        // shift
        case 16:
            KEYSPRESSED.SHIFT = true;
            break;
        default:
            console.log(e.keyCode);
    }
}

window.onkeyup = function (e) {
    switch (e.keyCode) {
        // w
        case 87:
            KEYSPRESSED.W = false;
            break;
        // a
        case 65:
            KEYSPRESSED.A = false;
            break;
        // s
        case 83:
            KEYSPRESSED.S = false;
            break;
        // d
        case 68:
            KEYSPRESSED.D = false;
            break;
        // ctrl
        case 67:
            KEYSPRESSED.C = false;
            break;
        case 16:
            KEYSPRESSED.SHIFT = false;
            break;
        default:
            //console.log(e.keyCode);
    }
}