import { Piece } from "./pieces";

type Square = {
	x: number;
	y: number;
	piece: Piece | null;
};

const board = document.querySelector(".grid-container");

if (!board) {
	throw new Error("Board element not found");
}

let selectedSquare: HTMLElement | null = null;
let validMoves: Square[] | null = null;

function placeChessPiece(
	type: string,
	color: string,
	position: { x: number; y: number },
	square: HTMLDivElement,
): Piece {
	const piece = new Piece(type, color, position);
	const image = document.createElement("img");

	image.src = piece.getImage();
	image.classList.add("chess-piece");

	square.appendChild(image);

	return piece;
}

function getSquareIndex(row: number, col: number): number {
	return row * 8 + col;
}

function getValidPawnMoves(pawnSquare: HTMLElement): Square[] {
	let moves = [];

	const row = Number(pawnSquare.dataset.row);
	const col = Number(pawnSquare.dataset.col);

	const squareState = boardState[getSquareIndex(row, col)];

	const aboveSquare = boardState[getSquareIndex(row - 1, col)];
	const aboveSquare2 = boardState[getSquareIndex(row - 2, col)];

	if (aboveSquare.piece == null) {
		moves.push(aboveSquare);
	}

	if (aboveSquare2.piece == null && row == 6) {
		moves.push(aboveSquare2);
	}

	return moves;
}

const boardState: Square[] = new Array(64);

for (let i = 0; i < 64; i++) {
	const square = document.createElement("div");

	const row = Math.floor(i / 8);
	const col = i % 8;

	square.dataset.row = String(row);
	square.dataset.col = String(col);

	if ((row + col) % 2 === 0) {
		// even squares
		square.classList.add("light-square");
	} else {
		// odd squares
		square.classList.add("dark-square");
	}

	let pieceCreated = null;

	// pawns

	if (row == 1) {
		pieceCreated = placeChessPiece("pawn", "dark", { x: col, y: row }, square);
	}

	if (row == 6) {
		pieceCreated = placeChessPiece("pawn", "light", { x: col, y: row }, square);
	}

	// rooks

	if (row == 0 && (col == 0 || col == 7)) {
		pieceCreated = placeChessPiece("rook", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && (col == 0 || col == 7)) {
		pieceCreated = placeChessPiece("rook", "light", { x: col, y: row }, square);
	}

	// knights

	if (row == 0 && (col == 1 || col == 6)) {
		pieceCreated = placeChessPiece(
			"knight",
			"dark",
			{ x: col, y: row },
			square,
		);
	}

	if (row == 7 && (col == 1 || col == 6)) {
		pieceCreated = placeChessPiece(
			"knight",
			"light",
			{ x: col, y: row },
			square,
		);
	}

	// bishops

	if (row == 0 && (col == 2 || col == 5)) {
		pieceCreated = placeChessPiece(
			"bishop",
			"dark",
			{ x: col, y: row },
			square,
		);
	}

	if (row == 7 && (col == 2 || col == 5)) {
		pieceCreated = placeChessPiece(
			"bishop",
			"light",
			{ x: col, y: row },
			square,
		);
	}

	// queens

	if (row == 0 && col == 3) {
		pieceCreated = placeChessPiece("queen", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && col == 3) {
		pieceCreated = placeChessPiece(
			"queen",
			"light",
			{ x: col, y: row },
			square,
		);
	}

	// kings

	if (row == 0 && col == 4) {
		pieceCreated = placeChessPiece("king", "dark", { x: col, y: row }, square);
	}

	if (row == 7 && col == 4) {
		pieceCreated = placeChessPiece("king", "light", { x: col, y: row }, square);
	}

	boardState[getSquareIndex(row, col)] = {
		x: col,
		y: row,
		piece: pieceCreated,
	};

	board.appendChild(square);
}

console.log(boardState);

board.addEventListener("click", (event) => {
	const previousSquare = selectedSquare;
	const targetSquare = (event.target as HTMLElement).closest("div")!;

	// show possible moves

	// wipe previous valid move highlights
	if (validMoves) {
		for (const square of validMoves) {
			const domSquare = document.querySelector(
				`[data-row="${square.y}"][data-col="${square.x}"]`,
			);
			domSquare!.classList.remove("valid-move");
		}
	}

	// calculate new valid moves if the square has a piece on it

	if (targetSquare.hasChildNodes()) {
		validMoves = getValidPawnMoves(targetSquare);

		if (!validMoves) {
			return;
		}

		for (const square of validMoves) {
			const domSquare = document.querySelector(
				`[data-row="${square.y}"][data-col="${square.x}"]`,
			);
			domSquare!.classList.add("valid-move");
		}
	}

	// movement logic

	if (previousSquare != null) {
		// already have a selected square, remove the highlight
		previousSquare.classList.remove("selected");

		// move piece if valid move is selected

		if (
			previousSquare.hasChildNodes() &&
			targetSquare !== previousSquare &&
			!targetSquare.hasChildNodes()
		) {
			// If the previous square has a piece, move the piece to the new square

			const previousSquareIndex = getSquareIndex(
				Number(previousSquare.dataset.row),
				Number(previousSquare.dataset.col),
			);

			const targetSquareIndex = getSquareIndex(
				Number(targetSquare.dataset.row),
				Number(targetSquare.dataset.col),
			);

			const piece = previousSquare.removeChild(previousSquare.firstChild!);
			targetSquare.appendChild(piece);

			targetSquare.classList.remove("selected");

			boardState[targetSquareIndex].piece =
				boardState[previousSquareIndex].piece;
			boardState[previousSquareIndex].piece = null;

			return;
		}
	}

	selectedSquare = targetSquare;
	selectedSquare.classList.add("selected");
});
