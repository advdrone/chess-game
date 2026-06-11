import { Piece } from "./pieces";

const board = document.querySelector(".grid-container");

if (!board) {
	throw new Error("Board element not found");
}

let selectedSquare: HTMLElement | null = null;

function placeChessPiece(
	type: string,
	color: string,
	position: { x: number; y: number },
	square: HTMLDivElement,
) {
	const piece = new Piece(type, color, position);
	const image = document.createElement("img");

	image.src = piece.getImage();
	image.classList.add("chess-piece");

	square.appendChild(image);
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

	// pawns

	if (row == 1) {
		placeChessPiece("pawn", "dark", { x: col, y: row }, square);
	}

	if (row == 6) {
		placeChessPiece("pawn", "light", { x: col, y: row }, square);
	}

	// rooks

	if (row == 0 && (col == 0 || col == 7)) {
		placeChessPiece("rook", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && (col == 0 || col == 7)) {
		placeChessPiece("rook", "light", { x: col, y: row }, square);
	}

	// knights

	if (row == 0 && (col == 1 || col == 6)) {
		placeChessPiece("knight", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && (col == 1 || col == 6)) {
		placeChessPiece("knight", "light", { x: col, y: row }, square);
	}

	// bishops

	if (row == 0 && (col == 2 || col == 5)) {
		placeChessPiece("bishop", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && (col == 2 || col == 5)) {
		placeChessPiece("bishop", "light", { x: col, y: row }, square);
	}

	// queens

	if (row == 0 && col == 3) {
		placeChessPiece("queen", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && col == 3) {
		placeChessPiece("queen", "light", { x: col, y: row }, square);
	}

	// kings

	if (row == 0 && col == 4) {
		placeChessPiece("king", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && col == 4) {
		placeChessPiece("king", "light", { x: col, y: row }, square);
	}

	board.appendChild(square);
}

board.addEventListener("click", (event) => {
	const previousSquare = selectedSquare;
	const targetSquare = event.target as HTMLElement;

	if (previousSquare != null) {
		// already have a selected square, remove the highlight
		previousSquare.classList.remove("selected");

		console.log(
			"Previous square has child nodes:",
			previousSquare.hasChildNodes(),
		);

		if (previousSquare.hasChildNodes()) {
			// If the previous square has a piece, move the piece to the new square

			const piece = previousSquare.removeChild(previousSquare.firstChild!);
			targetSquare.appendChild(piece);

			console.log("Moved piece from", previousSquare, "to", targetSquare);
		}
	}

	selectedSquare = event.target as HTMLElement;
	selectedSquare.classList.add("selected");
});
