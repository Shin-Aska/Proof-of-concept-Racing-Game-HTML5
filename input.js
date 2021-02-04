var keys = {}


function registerKey(e) {
    keys[e.keyCode] = 1;
}

function deregisterKey(e) {
    keys[e.keyCode] = 0;
}

K_UP = 38;
K_LEFT = 37;
K_RIGHT = 39;

document.onkeydown = registerKey;
document.onkeyup = deregisterKey;

function forceUp() {
    keys[K_UP] = 1;
}

function forceLeft() {
    keys[K_LEFT] = 1;
}

function forceRight() {
    keys[K_RIGHT] = 1;
}

function unforceUp() {
    keys[K_UP] = 0;
}

function unforceLeft() {
    keys[K_LEFT] = 0;
}

function unforceRight() {
    keys[K_RIGHT] = 0;
}