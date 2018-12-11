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
		// Calculate average z
		this.z = (this.start.z + this.end.z) * 0.5;
		// Calculate fade-out
		const fadeA = Math.max(0, Math.min((3 - this.z) / 6, 0.5)) * 0.5;
		if (fadeA > 0) {
			this.fadeColor = `rgba(255, 255, 255, ${fadeA})`;
		} else {
			this.fadeColor = null;
		}
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

		ctx.strokeStyle = 'rgba(0,0,0,0.16)';
		ctx.lineWidth = (this.width + 2) * V_RATIO;
		ctx.lineCap = 'butt';
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

		ctx.lineWidth = this.width * V_RATIO;
		ctx.strokeStyle = this.color;
		ctx.lineCap = 'round';
		ctx.stroke();
		// // Fade-out
		// if (this.fadeColor) {
		// 	ctx.strokeStyle = this.fadeColor;
		// 	ctx.stroke();
		// }
	}
}

// Represents a Leaf
class Leaf {

	constructor(json) {
		this.start = P(json.x, json.y, json.z);
		const l = this.l = irange(40, 80);
		const a = this.a = json.a || 0;
		this.end = P(
			this.start.x + l * Math.cos(a),
			this.start.y + l * Math.sin(a),
			this.start.z + range(-1, 1)
		);
		this.z = Math.max(this.start.z, this.end.z);
		// this.z = (this.start.z + this.end.z) * 0.5;

		// Create mirrored control points
		const a1 = 0.75;
		const l1 = this.l * range(0.25, 0.4);
		const z1 = (this.end.z - this.start.z) * 0.3333;
		this.fm1 = P(
			this.start.x + l1 * Math.cos(a + a1),
			this.start.y + l1 * Math.sin(a + a1),
			this.z + z1
		);
		this.sm1 = P(
			this.start.x + l1 * Math.cos(a - a1),
			this.start.y + l1 * Math.sin(a - a1),
			this.z + z1
		);
		
		const a2 = 0.5;
		const l2 = this.l * range(0.6, 0.75);
		const z2 = (this.end.z - this.start.z) * 0.6667;
		this.fm2 = P(
			this.start.x + l2 * Math.cos(a + a2),
			this.start.y + l2 * Math.sin(a + a2),
			this.z + z2
		);
		this.sm2 = P(
			this.start.x + l2 * Math.cos(a - a2),
			this.start.y + l2 * Math.sin(a - a2),
			this.z + z2
		);

		this.t = json.t || 0;
		this.duration = json.duration || 250;
		this.tFinal = this.t + this.duration;
		this.color = json.color || '#558B2F';

		this.final = {
			fm1: this.fm1.clone(),
			fm2: this.fm2.clone(),
			sm1: this.sm1.clone(),
			sm2: this.sm2.clone(),
			end: this.end.clone()
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
				// this.md1 = this.final.md1.clone();
				// this.md2 = this.final.md2.clone();
				// this.end = this.final.end.clone();
			}
		} else {
			// Animate
			this.isAnimating = true;
			const progress = (T - this.t) / this.duration;
			const mProgress = Math.sin(PI / 2 * progress);
			this.animatePoint(this.end, this.start, this.final.end, mProgress);

			this.animatePoint(this.fm1, this.start, this.final.fm1, mProgress);
			this.animatePoint(this.fm2, this.start, this.final.fm2, mProgress);
			this.animatePoint(this.sm1, this.start, this.final.sm1, mProgress);
			this.animatePoint(this.sm2, this.start, this.final.sm2, mProgress);
			// this.width = (0.75 + 0.25 * mProgress) * this.final.width;
		}

		ctx.fillStyle = this.color;
		ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
		ctx.lineWidth = 1.25 * V_RATIO;
		ctx.beginPath();
		ctx.moveTo(
			x(this.start.vx), y(this.start.vy)
		);
		ctx.bezierCurveTo(
			x(this.fm1.vx),   y(this.fm1.vy),
		   x(this.fm2.vx),   y(this.fm2.vy),
		   x(this.end.vx),   y(this.end.vy)
		);
		ctx.bezierCurveTo(
		   x(this.sm2.vx),   y(this.sm2.vy),
			x(this.sm1.vx),   y(this.sm1.vy),
		   x(this.start.vx), y(this.start.vy)
		);
		ctx.fill();
		ctx.stroke();
	}
}

// Converts an x coordinate from its logical position to its
// position on the canvas (based on ratio, view pos, etc.)
const x = n => (n - V_X) * V_RATIO;
// Converts a y coordinate from its logical position to its
// position on the canvas (based on ratio, view pos, etc.)
const y = n => (n - V_Y) * V_RATIO;