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

export function getValidRookMoves(
	boardState: Square[],
	rookSquare: HTMLElement,
): Square[] {
	let moves = [];

	const row = Number(rookSquare.dataset.row);
	const col = Number(rookSquare.dataset.col);

	for (let i = 0; i < 64; i++) {
		const i_row = Math.floor(i / 8);
		const i_col = i % 8;

		if (i_row == row && boardState[i].piece == null) {
			moves.push(boardState[getSquareIndex(i_row, i_col)]);
		}

		if (i_col == col && boardState[i].piece == null) {
			moves.push(boardState[getSquareIndex(i_row, i_col)]);
		}
	}

	return moves;
}
