class Piece {
	constructor(
		public type: string,
		public color: string,
		public position: { x: number; y: number },
	) {
		console.log(
			`Created a ${color} ${type} at position (${position.x}, ${position.y})`,
		);
	}
}

export { Piece };
