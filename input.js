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
