// Timing variables
T = 0;

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

	// Returns a copy of this point
	clone() {
		return new Point(this.x, this.y, this.z);
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
		this.t = options.t || 0;
		this.duration = options.duration || 250;
		this.tFinal = this.t + this.duration;
		this.isAnimating = false;
		this.color = options.color || 'black';
		this.width = options.width || 1;
		// Remember final state, for animation
		this.final = {
			md1: md1.clone(),
			md2: md2.clone(),
			end: end.clone(),
			width: this.width
		};
	}

	// Updates the values of a Point based on animation state
	animatePoint(p, start, end, t) {
		p.x = start.x + (end.x - start.x) * t;
		p.y = start.y + (end.y - start.y) * t;
		p.z = start.z + (end.z - start.z) * t;
	}

	render() {
		// If this curve hasn't appeared yet
		if (this.t > T) {
			// Stop here
			return;
		} else if (this.tFinal <= T) {
			// The animation has completed
			if (this.isAnimating === true) {
				this.isAnimating = false;
				this.md1 = this.final.md1.clone();
				this.md2 = this.final.md2.clone();
				this.end = this.final.end.clone();
			}
		} else {
			// Animate
			this.isAnimating = true;
			const progress = /*Math.sin(PI / 2 **/ (T - this.t) / this.duration/*)*/;
			// const mProgress = Math.min(progress * 3, 1);
			const mProgress = Math.sin(PI / 2 * Math.min(progress * 1.75, 1));
			this.animatePoint(this.md1, this.start, this.final.md1, mProgress);
			this.animatePoint(this.md2, this.start, this.final.md2, mProgress);
			this.animatePoint(this.end, this.start, this.final.end, progress);
			this.width = (0.75 + 0.25 * mProgress) * this.final.width;
		}

		ctx.strokeStyle = this.color;
		ctx.lineWidth = this.width * V_RATIO;
		ctx.lineCap = 'round';
		// ctx.globalAlpha = Math.max(0.5, Math.min((5 - this.start.z), 1));
		ctx.beginPath();
		ctx.moveTo(
			x(this.start.vx), y(this.start.vy)
		);
		ctx.bezierCurveTo(
			x(this.md1.vx),   y(this.md1.vy),
		   x(this.md2.vx),   y(this.md2.vy),
		   x(this.end.vx),   y(this.end.vy)
		);
		ctx.stroke();
	}
}

// Converts an x coordinate from its logical position to its
// position on the canvas (based on ratio, view pos, etc.)
const x = n => (n - V_X) * V_RATIO;
const y = n => (n - V_Y) * V_RATIO;