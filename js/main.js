// Detect touch devices
const IS_TOUCH_DEVICE = !!(('ontouchstart' in window) ||
	window.DocumentTouch && document instanceof DocumentTouch);
const DPI = window.devicePixelRatio || 1;

plant = null;
c = null;
ctx = null;

document.on('DOMContentLoaded', () => {
	// Canvas variables
	c = document.q('#view');
	ctx = c.getContext('2d');
	// Testing: Create a full plant
	plant = new Plant();

	const resize = () => {
		V_RATIO = Math.min(
			window.innerWidth / V_W,
			window.innerHeight / V_H
		);

		c.style.width = `${window.innerWidth}px`;
		c.style.height = `${window.innerHeight}px`;

		V_X = (V_W - (window.innerWidth  / V_RATIO)) * 0.5;
		V_Y = V_H - (window.innerHeight / V_RATIO);

		V_RATIO *= DPI;
		c.width = window.innerWidth * DPI;
		c.height = window.innerHeight * DPI;
	};

	window.on('resize', resize);
	resize();

	// Start the animation loop
	requestAnimationFrame(update);
});

PREV_FRAME = Date.now();
DRAGGING = null;
DRAG_START_X = 0;
DRAG_START_Y = 0;

function update() {
	requestAnimationFrame(update);

	T += Date.now() - PREV_FRAME;
	PREV_FRAME = Date.now();

	// Update input variables
	if (isPressed === true) {
		if (isHeld === false) {
			isHeld = true;
		} else {
			isPressed = false;
		}
	} else if (isReleased === true) {
		isHeld = false;
	}

	// Update pointer position
	pointerX = (rawPointerX / V_RATIO) + V_X;
	pointerY = (rawPointerY / V_RATIO) + V_Y;

	// Clear the canvas
	ctx.clearRect(0, 0, c.width, c.height);

	// TEMP: render cursor
	ctx.beginPath();
	ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
	ctx.arc(x(pointerX), y(pointerY), V_RATIO * 8, 0, TAU);
	ctx.fill();

	// If the user just pressed down
	if (isPressed === true) {
		// Look for a joint
		let nearest = null;
		let nearestD = Infinity;
		for (let [point, part] of plant.joints) {
			const d = point.vDistance(pointerX, pointerY);
			if (d < nearestD) {
				nearest = part;
				nearestD = d;
			}
		}
		// If a nearby joint was found
		if (nearestD < 32) {
			// Select it
			DRAGGING = nearest;
			DRAG_START_X = pointerX;
			DRAG_START_Y = pointerY;
		}
	} else if (isReleased === true && DRAGGING !== null) {
		// Unselect part
		DRAGGING.setD(0, 0);
		for (let part of DRAGGING.ancestors) {
			part.setD(0, 0);
		}
		for (let sub of DRAGGING.descendents) {
			for (let part of sub) {
				part.setD(0, 0);
			}
		}
		DRAGGING = null;
	}

	// Dragging
	if (DRAGGING !== null) {
		// Calculate pull
		let x = pointerX - DRAG_START_X;
		let y = pointerY - DRAG_START_Y;
		let d = Math.sqrt(x * x + y * y) * 0.3333;
		const a = Math.atan2(y, x);
		const MAX_D = 128;
		if (d > MAX_D) {
			d = MAX_D;
		}
		x = d * Math.cos(a);
		y = d * Math.sin(a);
		// Update main part
		DRAGGING.setD(x, y);

		// Update ancestors
		const r = 0.5;
		let ratio = r;
		for (let part of DRAGGING.ancestors) {
			part.setD(ratio * x, ratio * y);
			ratio *= r;
		}
		// Update descendents
		ratio = r;
		for (let sub of DRAGGING.descendents) {
			for (let part of sub) {
				part.setD(ratio * x, ratio * y);
			}
			ratio *= r;
		}
	}

	// Render the plant
	plant.render();

	// Update the Z_X and Z_Y to match Z_T_X and Z_T_Y
	const M_D = 0.01;
	if (Z_X !== Z_T_X) {
		const D = Z_T_X - Z_X;
		if (Math.abs(D) < M_D) {
			Z_X = Z_T_X;
		} else {
			Z_X += D * 0.2;
		}
	}
	if (Z_Y !== Z_T_Y) {
		const D = Z_T_Y - Z_Y;
		if (Math.abs(D) < M_D) {
			Z_Y = Z_T_Y;
		} else {
			Z_Y += D * 0.2;
		}
	}

	// Update input
	isPressed = false;
	isReleased = false;
}

// returns a number between 0 and n, inclusive of 0, but not n
function random(n = 1) {
	// TODO: use a custom seeded RNG implementation
	return n * Math.random();
}

// returns an integer between 0 and n - 1, inclusive
function irandom(n) {
	return Math.floor(random(n));
}

// returns a number between min and max, inclusive
function range(min, max) {
	return min + random(max - min);
}

// returns an integer between min and max, inclusive
function irange(min, max) {
	return min + irandom(max - min + 1);
}

function choose(...args) {
	return args[irandom(args.length)];
}

function sleep(n) {
	return new Promise(r => setTimeout(() => r(), n));
}