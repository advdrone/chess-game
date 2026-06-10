import { Piece } from "./pieces";

const board = document.querySelector(".grid-container");

if (!board) {
	throw new Error("Board element not found");
}

for (let i = 0; i < 64; i++) {
	const square = document.createElement("div");

	const row = Math.floor(i / 8);
	const col = i % 8;

	if ((row + col) % 2 === 0) {
		// even squares
		square.classList.add("light-square");
	} else {
		// odd squares
		square.classList.add("dark-square");
	}

	if (row == 6) {
		const piece = new Piece("pawn", "light", { x: col, y: row });
		const image = document.createElement("img");

		image.src = piece.getImage();
		image.classList.add("chess-piece");

		console.log(image.src);
		square.appendChild(image);
	}

	board.appendChild(square);
}
