class Plant {

	constructor() {
		// Set properties for generation
		this.hasFlowers = true;
		this.hasThorns = true;
		this.splitPattern = choose(
			[2, 3, 2, 3, 1],
			[2, 2, 3, 2, 1],
			[3, 2, 2, 2, 1],
			[3, 2, 3, 2, 1],
			[3, 3, 2, 2, 1],
			[4, 2, 2, 3, 1]
		);
		this.minW = 4.5;
		
		// Generate parts
		this.parts = [];
		this.joints = [];
		const x = V_W / 2;
		const y = V_H + 50;
		const z = 0;
		this.generate({
			start: P(x, y, z),
			x: x,
			y: y,
			z: z,
			a: 3 * PI / 2,
			l: 200,
			w: 10,
			t: T,
			path: [],
			patternIndex: 0
		});

		// Sort the parts
		this.sort();
	}

	// Generates the surface portion of the plant
	generate(prev) {
		// If the width is too low
		let leaf;
		if (prev.w < this.minW) {
			// Stop here
			return;
		} else if (prev.patternIndex !== 0 && this.hasThorns && irandom(5)) {
			// Add a thorn
			const duration = irange(800, 5000);
			leaf = new Leaf({
				start: prev.start,
				x: prev.x,
				y: prev.y,
				z: prev.z,
				// Make the angle roughly perpendicular to this branch
				a: prev.a + choose(-1, 1) * PI / 2 + range(-0.36, 0.36),
				t: prev.t - 50,
				duration: duration
			});
			this.parts.push(leaf);
			prev.part.leaves.push(leaf);
			prev.t += range(0.5, 1) * duration;
		}

		// Calculate the end destination
		let { x, y, z, a } = prev;
		x += prev.l * Math.cos(a);
		y += prev.l * Math.sin(a);
		z += range(-1.25, 1.25);
		const duration = prev.l * range(8, 12);

		// Calculate control points
		const dx  = x - prev.x;
		const dy  = y - prev.y;
		const dz  = z - prev.z;
		const dv2 = prev.l * 0.4;
		const dvz = 1.5;

		// CP1
		const r1 = range(0.2, 0.6);
		const cp1 = P(
			prev.x + dx * r1 + range(-dv2, dv2),
			prev.y + dy * r1 + range(-dv2, dv2),
			prev.z + dz * r1 + range(-dvz, dvz)
		);

		// CP2
		const r2 = range(0.4, 0.8);
		const cp2 = P(
			prev.x + dx * r2 + range(-dv2, dv2),
			prev.y + dy * r2 + range(-dv2, dv2),
			prev.z + dz * r2 + range(-dvz, dvz)
		);

		// End
		const end = P(x, y, z);
		const part = new Curve(
			prev.start,
			cp1,
			cp2,
			end,
			{
				color: '#3E2723',
				width: prev.w,
				t: prev.t,
				duration: duration,
				ancestors: prev.path
			}
		);
		this.parts.push(part);
		this.joints.push([end, part]);

		// Update ancestors
		if (prev.group) {
			if (prev.group.length === 0) {
				for (let x of part.ancestors) {
					x.descendents.push(prev.group);
				}
			}
			prev.group.push(part);
		}

		// Get the number of children this should split into
		const count = this.splitPattern[prev.patternIndex];
		// Create children
		const group = [];
		for (let i = count; i --; ) {
			this.generate({
				start: end,
				x: x,
				y: y,
				z: z,
				a: a + range(-0.96, 0.96),
				l: prev.l * range(0.7, 0.95),
				w: prev.w * range(0.65, 0.85),
				t: prev.t + duration,
				part: part,
				path: prev.path.concat(part),
				group: group,
				patternIndex: prev.patternIndex + 1
			});
		}
	}

	// Generates the roots of the plant
	generateRoots() {
		// TODO
	}

	// Sorts each of the parts of this plant so that they render
	// with the respect to depth (z)
	sort() {
		this.parts = this.parts.sort((a, b) => a.z - b.z);
	}

	// Renders the entire plant to the canvas
	render() {
		for (let p of this.parts) {
			p.render();
		}
	}
}