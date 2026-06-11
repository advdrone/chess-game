import {
	determineIfInCheck,
	getKingSquare,
	getValidBishopMoves,
	getValidKingMoves,
	getValidKnightMoves,
	getValidPawnMoves,
	getValidQueenMoves,
	getValidRookMoves,
} from "./moves";
import { Piece } from "./pieces";
import { Square } from "./types";

const board = document.querySelector(".grid-container");

if (!board) {
	throw new Error("Board element not found");
}

let selectedSquare: HTMLElement | null = null;
let validMoves: Square[] | null = null;

let playerTurn: string = "light";

function getDomSquareFromBoardSquare(row: number, col: number) {
	return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

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

	const targetSquareIndex = getSquareIndex(
		Number(targetSquare.dataset.row),
		Number(targetSquare.dataset.col),
	);

	if (
		boardState[targetSquareIndex].piece != null &&
		boardState[targetSquareIndex].piece.color != playerTurn &&
		previousSquare == null // if we capture a piece, ignore
	) {
		return false;
	}

	if (validMoves) {
		// show possible moves

		// wipe previous valid move highlights
		for (const square of validMoves) {
			const domSquare = getDomSquareFromBoardSquare(square.y, square.x);
			domSquare!.classList.remove("valid-move");
		}
	}

	// movement logic

	if (previousSquare != null) {
		// already have a selected square, remove the highlight
		previousSquare.classList.remove("selected");

		// move piece if valid move is selected

		if (previousSquare.hasChildNodes() && targetSquare !== previousSquare) {
			// If the previous square has a piece, move the piece to the new square

			const previousSquareIndex = getSquareIndex(
				Number(previousSquare.dataset.row),
				Number(previousSquare.dataset.col),
			);

			if (
				validMoves &&
				validMoves.find(
					(square) =>
						square.x == targetSquareIndex % 8 &&
						square.y == Math.floor(targetSquareIndex / 8),
				) == null
			) {
				selectedSquare = null;
				return;
			}

			if (targetSquare.hasChildNodes()) {
				targetSquare.removeChild(targetSquare.firstChild);
			}

			const piece = previousSquare.removeChild(previousSquare.firstChild!);
			targetSquare.appendChild(piece);

			targetSquare.classList.remove("selected");

			boardState[targetSquareIndex].piece =
				boardState[previousSquareIndex].piece;
			boardState[previousSquareIndex].piece = null;

			playerTurn = (playerTurn == "light" && "dark") || "light";

			const kingSquare = getKingSquare(boardState, playerTurn);
			const kingDomSquare = getDomSquareFromBoardSquare(
				kingSquare.y,
				kingSquare.x,
			);

			if (kingDomSquare && determineIfInCheck(boardState, kingDomSquare)) {
				console.log("Do something here to indicate check");
			}

			selectedSquare = null;

			return;
		}
	}

	// calculate new valid moves if the square has a piece on it

	if (targetSquare.hasChildNodes()) {
		const piece =
			boardState[
				getSquareIndex(
					Number(targetSquare.dataset.row),
					Number(targetSquare.dataset.col),
				)
			].piece;

		if (piece?.type == "pawn") {
			validMoves = getValidPawnMoves(boardState, targetSquare);
		} else if (piece?.type == "knight") {
			validMoves = getValidKnightMoves(boardState, targetSquare);
		} else if (piece?.type == "rook") {
			validMoves = getValidRookMoves(boardState, targetSquare);
		} else if (piece?.type == "king") {
			validMoves = getValidKingMoves(boardState, targetSquare);
		} else if (piece?.type == "bishop") {
			validMoves = getValidBishopMoves(boardState, targetSquare);
		} else if (piece?.type == "queen") {
			validMoves = getValidQueenMoves(boardState, targetSquare);
		} else {
			validMoves = null;
		}

		if (!validMoves) {
			return;
		}

		for (const square of validMoves) {
			const domSquare = getDomSquareFromBoardSquare(square.y, square.x);
			domSquare!.classList.add("valid-move");
		}
	}

	selectedSquare = targetSquare;
	selectedSquare.classList.add("selected");
});
