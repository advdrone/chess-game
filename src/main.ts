import captureSound from "./sounds/capture.mp3";
import moveSound from "./sounds/move-self.mp3";

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

const moveAudio = new Audio(moveSound);
const captureAudio = new Audio(captureSound);

const board = document.querySelector(".grid-container");

if (!board) {
	throw new Error("Board element not found");
}

let selectedSquare: HTMLElement | null = null;
let validMoves: Square[] | null = null;
let kingInCheckSquare: HTMLElement | null = null;

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

function getValidMoves(targetSquare: HTMLElement): Square[] | null {
	if (!targetSquare.hasChildNodes()) {
		return null;
	}

	const piece =
		boardState[
			getSquareIndex(
				Number(targetSquare.dataset.row),
				Number(targetSquare.dataset.col),
			)
		].piece;

	let possibleMoves: Square[] | null;

	if (piece?.type == "pawn") {
		possibleMoves = getValidPawnMoves(boardState, targetSquare);
	} else if (piece?.type == "knight") {
		possibleMoves = getValidKnightMoves(boardState, targetSquare);
	} else if (piece?.type == "rook") {
		possibleMoves = getValidRookMoves(boardState, targetSquare);
	} else if (piece?.type == "king") {
		possibleMoves = getValidKingMoves(boardState, targetSquare);
	} else if (piece?.type == "bishop") {
		possibleMoves = getValidBishopMoves(boardState, targetSquare);
	} else if (piece?.type == "queen") {
		possibleMoves = getValidQueenMoves(boardState, targetSquare);
	} else {
		possibleMoves = null;

		return null;
	}

	if (!possibleMoves) {
		return null;
	}

	// remove moves where the king would be in check
	possibleMoves = possibleMoves.filter((square) =>
		simulateMove(
			targetSquare,
			getDomSquareFromBoardSquare(square.y, square.x) as HTMLElement,
		),
	);

	return possibleMoves.length > 0 ? possibleMoves : null;
}

function getCheckmate() {
	let isMated = true;

	for (let i = 0; i < 64; i++) {
		if (boardState[i].piece == null) {
			continue;
		}

		if (boardState[i].piece?.color == playerTurn) {
			const domSquare = getDomSquareFromBoardSquare(
				boardState[i].y,
				boardState[i].x,
			);

			const validMoves = getValidMoves(domSquare);

			if (validMoves != null) {
				isMated = false;
			} else {
				console.log("Not checkmate b/c of piece: ", boardState[i].piece);
			}
		}
	}

	console.log("Checkmate: ", isMated);

	return isMated;
}

function selectSquare(square: HTMLElement) {
	hideValidMoves();

	validMoves = canSelectSquare(square) ? getValidMoves(square) : null;

	if (validMoves) {
		selectedSquare = square;
		square.classList.add("selected");
		showValidMoves(validMoves);

		return validMoves;
	}
}

function movePiece(
	previousSquare: HTMLElement,
	targetSquare: HTMLElement,
): boolean {
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
				return false;
			}

			if (targetSquare.hasChildNodes()) {
				// capture piece

				targetSquare.removeChild(targetSquare.firstChild!);

				captureAudio.play();
			} else {
				moveAudio.play();
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
				kingDomSquare?.classList.add("king-in-check");

				kingInCheckSquare = kingDomSquare;

				console.log("Checkmate: ", getCheckmate());
			} else {
				kingInCheckSquare?.classList.remove("king-in-check");
				kingInCheckSquare = null;
			}

			selectedSquare = null;

			hideValidMoves();

			return true;
		}
	}

	return false; // nothing moved
}

function showValidMoves(possibleMoves: Square[]) {
	for (const square of possibleMoves!) {
		const domSquare = getDomSquareFromBoardSquare(square.y, square.x);
		domSquare!.classList.add("valid-move");
	}
}

function hideValidMoves() {
	if (validMoves) {
		// wipe previous valid move highlights
		for (const square of validMoves) {
			const domSquare = getDomSquareFromBoardSquare(square.y, square.x);
			domSquare!.classList.remove("valid-move");
		}
	}
}

function simulateMove(square_from: HTMLElement, square_to: HTMLElement) {
	// move is only legal if king isn't in check afterwards

	let boardStateClone = boardState.map((square) => ({ ...square }));

	const square_from_index = getSquareIndex(
		Number(square_from.dataset.row),
		Number(square_from.dataset.col),
	);

	const square_to_index = getSquareIndex(
		Number(square_to.dataset.row),
		Number(square_to.dataset.col),
	);

	boardStateClone[square_to_index].piece =
		boardStateClone[square_from_index].piece;

	boardStateClone[square_from_index].piece = null;

	const kingSquare = getKingSquare(boardStateClone, playerTurn);
	const kingDomSquare = getDomSquareFromBoardSquare(kingSquare.y, kingSquare.x);

	if (kingDomSquare && determineIfInCheck(boardStateClone, kingDomSquare)) {
		return false;
	}

	return true;
}

function canSelectSquare(targetSquare: HTMLElement) {
	const targetSquareIndex = getSquareIndex(
		Number(targetSquare.dataset.row),
		Number(targetSquare.dataset.col),
	);

	const piece = boardState[targetSquareIndex].piece;

	return piece?.color == playerTurn;
}

board.addEventListener("click", (event) => {
	const targetSquare = (event.target as HTMLElement).closest("div")!;

	// can only select king if it's in check

	const moved = movePiece(selectedSquare, targetSquare);

	if (!moved) {
		selectSquare(targetSquare);
	}
});

board.addEventListener("dragstart", (event) => {
	const targetSquare = (event.target as HTMLElement).closest("div")!;

	(event as DragEvent).dataTransfer!.effectAllowed = "move";

	selectSquare(targetSquare);
});

board.addEventListener("dragover", (event) => {
	(event as DragEvent).dataTransfer!.dropEffect = "move";

	event.preventDefault();
});

board.addEventListener("drop", (event) => {
	const targetSquare = (event.target as HTMLElement).closest("div")!;

	const moved = movePiece(selectedSquare, targetSquare);

	if (!moved) {
		selectSquare(targetSquare);
	}
});
