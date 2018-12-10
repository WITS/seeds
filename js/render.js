// Timing variables
T = Date.now();

// Screen size variables
V_W = 450;
V_H = 800;
V_RATIO = 1;
V_X = 0;
V_Y = 0;

// Parallax variables
Z_MAX = 500;
Z_MIN = -Z_MAX;
Z_RANGE = Z_MAX - Z_MIN;
Z_X = 0;
Z_Y = 0;
Z_T_X = 0;
Z_T_Y = 0;
const Z_RATIO = 0.05;

// Angle constants
const PI = Math.PI;
const TAU = 2 * PI;

class Point {

	constructor(x, y, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	// The current x to use for rendering this point
	get vx() {
		return this.x + this.z * Z_RATIO * Z_X;
	}

	// The current y to use for rendering this point
	get vy() {
		return this.y + this.z * Z_RATIO * Z_Y;
	}
}

P = (x, y, z = 0) => new Point(x, y, z);

// Represents a Bezier Curve
class Curve {

	constructor(start, md1, md2, end, options = {}) {
		this.start = start;
		this.md1 = md1;
		this.md2 = md2;
		this.end = end;
		this.color = options.color || 'black';
		this.width = options.width || 1;
	}

	render() {
		ctx.strokeStyle = this.color;
		ctx.lineWidth = this.width * V_RATIO;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(x(this.start.vx), y(this.start.vy));
		ctx.bezierCurveTo(x(this.md1.vx),   y(this.md1.vy),
		                  x(this.md2.vx),   y(this.md2.vy),
		                  x(this.end.vx),   y(this.end.vy));
		ctx.stroke();
	}
}

// Converts an x coordinate from its logical position to its
// position on the canvas (based on ratio, view pos, etc.)
const x = n => (n - V_X) * V_RATIO;
const y = n => (n - V_Y) * V_RATIO;