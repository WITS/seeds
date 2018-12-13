// General input
isPressed = false;
isHeld = false;
isReleased = false;
pointerX = 0;
pointerY = 0;
rawPointerX = 0;
rawPointerY = 0;

// Listen for parallax
if (!IS_TOUCH_DEVICE) {
	// Listen for mouse press
	window.on('mousedown', e => isPressed  = true);
	// And release
	window.on('mouseup',   e => isReleased = true);
	window.on('blur',      e => isReleased = true);
	// Mouse movement
	window.on('mousemove', e => {
		rawPointerX = e.clientX;
		rawPointerY = e.clientY;
		const x = Math.max(0, Math.min(e.clientX / window.innerWidth, 1));
		const y = Math.max(0, Math.min(e.clientY / window.innerHeight, 1));
		Z_T_X = Z_MIN + Z_RANGE * x;
		Z_T_Y = Z_MIN + Z_RANGE * y;
	});
} else {
	window.on('deviceorientation', e => {
		// console.log(e);
		// const x = ((270 + e.alpha) % 90) / 90;
		// const y = ((270 + e.beta ) % 90) / 90;
		// Z_T_X = Z_MIN + Z_RANGE * x;
		// Z_T_Y = Z_MIN + Z_RANGE * y;
		Z_T_X = Z_MAX * Math.sin(e.gamma * Math.PI / 90);
		// Z_T_X = Z_MAX * Math.sin(e.alpha * Math.PI / 180);
		Z_T_Y = Z_MAX * Math.sin(e.beta * Math.PI / 180);
	});
}