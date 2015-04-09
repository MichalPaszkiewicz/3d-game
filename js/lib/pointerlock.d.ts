interface HTMLElement {
    requestPointerLock(): void;
    mozRequestPointerLock(): void;
    webkitRequestPointerLock(): void;
}

interface Document {
    onpointerlockchange: (ev: Event) => any;
    onpointerlockerror: (ev: Event) => any;
    pointerLockElement?: HTMLElement;
    mozPointerLockElement?: HTMLElement;
    webkitPointerLockElement?: HTMLElement;
    exitPointerLock(): void;
    mozExitPointerLock(): void;
    webkitExitPointerLock(): void;
}

interface MouseEvent {
    movementX?: number;
    movementY?: number;
} 