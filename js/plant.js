class Plant {

	constructor(seed = Date.now()) {
		this.parts = [];
		// TODO: generate parts
		// TEMP: add some hardcoded parts
		this.parts.push(new Curve(
			P( 225, 800, 0      ),
			P( 200, 725, 0.3333 ),
			P( 250, 675, 0.6667 ),
			P( 225, 600, 1      ),
			{
				width: 8
			}
		));
		this.parts.push(new Curve(
			P( 225, 600, 1    ),
			P( 140, 550, 1.25 ),
			P( 240, 450, 4.25 ),
			P( 164, 400, 2    ),
			{
				width: 6
			}
		));
		this.parts.push(new Curve(
			P( 225, 600, 1    ),
			P( 250, 550, 1.25 ),
			P( 320, 500, -0.25 ),
			P( 300, 450, -1   ),
			{
				width: 6
			}
		));
		this.parts.push(new Curve(
			P( 225, 600, 1    ),
			P( 250, 550, 1.25 ),
			P( 270, 500, 2.25 ),
			P( 240, 450, 3   ),
			{
				width: 6
			}
		));
	}

	render() {
		for (let p of this.parts) {
			p.render();
		}
	}
}