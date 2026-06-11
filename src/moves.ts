import { Square } from "./types";

function getSquareIndex(row: number, col: number): number {
	return row * 8 + col;
}

export function getValidPawnMoves(
	boardState: Square[],
	pawnSquare: HTMLElement,
): Square[] {
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

export function getValidKnightMoves(
	boardState: Square[],
	knightSquare: HTMLElement,
): Square[] {
	let moves = [];

	const row = Number(knightSquare.dataset.row);
	const col = Number(knightSquare.dataset.col);

	const potentialMoves = [
		{ row: row + 1, col: col + 2 },
		{ row: row + 2, col: col - 1 },
		{ row: row - 2, col: col + 1 },
		{ row: row - 2, col: col - 1 },
		{ row: row + 1, col: col + 2 },
		{ row: row + 1, col: col - 2 },
		{ row: row - 1, col: col + 2 },
		{ row: row - 1, col: col - 2 },
	];

	for (const move of potentialMoves) {
		if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
			const targetSquare = boardState[getSquareIndex(move.row, move.col)];

			if (targetSquare.piece == null) {
				moves.push(targetSquare);
			}
		}
	}

	return moves;
}
