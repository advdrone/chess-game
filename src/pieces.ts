class Piece {
	constructor(
		public type: string,
		public color: string,
		public position: { x: number; y: number },
		public hasMoved: boolean = false
	) {}

	public getMoves() {}

	public getImage() {
		return `sprites/${this.color}_${this.type}.png`;
	}
}

export { Piece };
