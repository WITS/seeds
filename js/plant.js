class Plant {

	constructor() {
		// Set properties for generation
		this.hasFlowers = true;
		this.hasThorns = true;
		this.splitTypes = choose(
			[1, 2, 2, 2, 2, 2, 3, 3],
			[1, 2, 2, 2, 2],
			[2],
			[2, 2, 2, 3],
			[3],
			[1, 1, 1, 3, 4]
		);
		this.minW = 4.5;
		
		// Generate parts
		this.parts = [];
		this.generate({
			x: V_W / 2,
			y: V_H + 50,
			z: 0,
			a: 3 * PI / 2,
			l: 200,
			w: 10,
			t: T,
			path: []
		});
	}

	// Generates the surface portion of the plant
	generate(prev) {
		// If the width is too low
		if (prev.w < this.minW) {
			// Stop here
			return;
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

		this.parts.push(new Curve(
			P( prev.x, prev.y, prev.z ),
			cp1,
			cp2,
			P(      x,      y,      z ),
			{
				width: prev.w,
				t: prev.t,
				duration: duration
			}
		));

		let count = 0;
		do {
			count = this.splitTypes[irandom(this.splitTypes.length)];
		} while (count === 1 && prev.path.every(n => n === 1));

		for (let i = count; i --; ) {
			this.generate({
				x: x,
				y: y,
				z: z,
				a: a + range(-0.96, 0.96),
				l: prev.l * range(0.7, 0.95),
				w: prev.w * range(0.65, 0.85),
				t: prev.t + duration,
				path: prev.path.concat(count)
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
		// TODO
	}

	// Renders the entire plant to the canvas
	render() {
		for (let p of this.parts) {
			p.render();
		}
	}
}