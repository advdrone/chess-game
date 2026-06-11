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

// checks if two squares can see each other without obstructions in the same row

function hasRowLineOfSight(
	boardState: Square[],
	square_a: Square,
	square_b: Square,
): Boolean {
	const square_a_col = square_a.x;
	const square_b_col = square_b.x;

	const shared_row = square_a.y;

	for (
		let i = Math.min(square_a_col, square_b_col) + 1;
		i < Math.max(square_a_col, square_b_col);
		i++
	) {
		if (boardState[getSquareIndex(shared_row, i)].piece != null) {
			return false;
		}
	}

	return true;
}

function hasColLineOfSight( // squares guaranteed to be same column, different rows
	boardState: Square[],
	square_a: Square,
	square_b: Square,
): Boolean {
	const square_a_row = square_a.y;
	const square_b_row = square_b.y;

	const shared_col = square_a.x;

	for (
		let i = Math.min(square_a_row, square_b_row) + 1;
		i < Math.max(square_a_row, square_b_row);
		i++
	) {
		if (boardState[getSquareIndex(i, shared_col)].piece != null) {
			return false;
		}
	}

	return true;
}

export function getValidRookMoves(
	boardState: Square[],
	rookSquare: HTMLElement,
): Square[] {
	let moves = [];

	const row = Number(rookSquare.dataset.row);
	const col = Number(rookSquare.dataset.col);

	const rookSquareIndex = getSquareIndex(row, col);

	for (let i_col = 0; i_col < 8; i_col++) {
		const targetSquareIndex = getSquareIndex(row, i_col);

		if (
			boardState[targetSquareIndex].piece == null &&
			hasRowLineOfSight(
				boardState,
				boardState[rookSquareIndex],
				boardState[targetSquareIndex],
			)
		) {
			moves.push(boardState[targetSquareIndex]);
		}
	}

	for (let i_row = 0; i_row < 8; i_row++) {
		const targetSquareIndex = getSquareIndex(i_row, col);

		if (
			boardState[targetSquareIndex].piece == null &&
			hasColLineOfSight(
				boardState,
				boardState[rookSquareIndex],
				boardState[targetSquareIndex],
			)
		) {
			moves.push(boardState[targetSquareIndex]);
		}
	}

	return moves;
}
