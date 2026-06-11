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

	const isWhitePawn = squareState.piece?.color == "light";
	const direction = (isWhitePawn && -1) || 1;

	const offset1 = boardState[getSquareIndex(row + 1 * direction, col)];
	const offset2 = boardState[getSquareIndex(row + 2 * direction, col)];

	if (offset1.piece == null) {
		moves.push(offset1);
	}

	if (
		offset2.piece == null &&
		hasColLineOfSight(boardState, squareState, offset2) &&
		((isWhitePawn && row == 6) || (!isWhitePawn && row == 1))
	) {
		moves.push(offset2);
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

	const knightSquareState = boardState[getSquareIndex(row, col)];

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
			const targetSquareState = boardState[getSquareIndex(move.row, move.col)];

			if (
				(targetSquareState.piece &&
					targetSquareState.piece.color != knightSquareState.piece?.color) ||
				targetSquareState.piece == null
			) {
				moves.push(targetSquareState);
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
	const rookSquareState = boardState[rookSquareIndex];

	for (let i_col = 0; i_col < 8; i_col++) {
		const targetSquareIndex = getSquareIndex(row, i_col);
		const targetSquareState = boardState[targetSquareIndex];

		if (hasRowLineOfSight(boardState, rookSquareState, targetSquareState)) {
			if (
				(targetSquareState.piece &&
					targetSquareState.piece.color != rookSquareState.piece?.color) ||
				targetSquareState.piece == null
			) {
				moves.push(targetSquareState);
			}
		}
	}

	for (let i_row = 0; i_row < 8; i_row++) {
		const targetSquareIndex = getSquareIndex(i_row, col);
		const targetSquareState = boardState[targetSquareIndex];

		if (hasColLineOfSight(boardState, rookSquareState, targetSquareState)) {
			if (
				(targetSquareState.piece &&
					targetSquareState.piece.color != rookSquareState.piece?.color) ||
				targetSquareState.piece == null
			) {
				moves.push(targetSquareState);
			}
		}
	}

	return moves;
}

export function getValidKingMoves(
	boardState: Square[],
	kingSquare: HTMLElement,
): Square[] {
	let moves = [];

	const row = Number(kingSquare.dataset.row);
	const col = Number(kingSquare.dataset.col);

	const kingSquareIndex = getSquareIndex(row, col);

	// todo: in the future, add logic to prevent king from moving to places where it would be in check (subtract the getValid moves of all the opposite side's pieces from the king possible moves)

	const potentialMoves = [
		{ row: row - 1, col: col - 1 },
		{ row: row - 1, col: col },
		{ row: row - 1, col: col + 1 },
		{ row: row, col: col - 1 },
		{ row: row, col: col + 1 },
		{ row: row + 1, col: col - 1 },
		{ row: row + 1, col: col },
		{ row: row + 1, col: col + 1 },
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

function hasDiagonalLineOfSight(
	boardState: Square[],
	square_a: Square,
	square_b: Square,
): Boolean {
	const square_a_row = square_a.y;
	const square_a_col = square_a.x;

	const square_b_row = square_b.y;
	const square_b_col = square_b.x;

	// case 1: square a is to the top left of square b, meaning square a has lower row and col

	if (square_a_row < square_b_row && square_a_col < square_b_col) {
		for (
			let i = getSquareIndex(square_a_row, square_a_col);
			i < getSquareIndex(square_b_row, square_b_col);
			i = i + 9
		) {
			if (boardState[i].piece != null) {
				return false;
			}
		}
	}

	// case 2: square a is to the top right of square b, meaning square a has lower row but greater col

	if (square_a_row < square_b_row && square_a_col > square_b_col) {
		for (
			let i = getSquareIndex(square_a_row, square_a_col);
			i < getSquareIndex(square_b_row, square_b_col);
			i = i + 7
		) {
			if (boardState[i].piece != null) {
				return false;
			}
		}
	}

	// case 3: square a is to the bottom lef of square b, meaning square a has greater row but lower col

	if (square_a_row > square_b_row && square_a_col < square_b_col) {
		for (
			let i = getSquareIndex(square_a_row, square_a_col);
			i > getSquareIndex(square_b_row, square_b_col);
			i = i - 7
		) {
			if (boardState[i].piece != null) {
				return false;
			}
		}
	}

	// case 4: square a is to the bottom right of square b, meaning square a has greater row and col

	if (square_a_row > square_b_row && square_a_col > square_b_col) {
		for (
			let i = getSquareIndex(square_a_row, square_a_col);
			i > getSquareIndex(square_b_row, square_b_col);
			i = i - 9
		) {
			if (boardState[i].piece != null) {
				return false;
			}
		}
	}

	return true;
}

export function getValidBishopMoves(
	boardState: Square[],
	bishopSquare: HTMLElement,
): Square[] {
	let moves = [];

	const row = Number(bishopSquare.dataset.row);
	const col = Number(bishopSquare.dataset.col);

	const bishopSquareIndex = getSquareIndex(row, col);
	const bishopBoardSquare = boardState[bishopSquareIndex];

	for (let i = 1; i < 8; i++) {
		// go outwards grabbing the corners with increasing gaps repeatedly until it can't anymore

		/// top left
		if (row - i >= 0 && col - i >= 0) {
			const top_left = boardState[getSquareIndex(row - i, col - i)];

			if (
				top_left.piece == null &&
				hasDiagonalLineOfSight(boardState, top_left, bishopBoardSquare)
			) {
				moves.push(top_left);
			}
		}

		/// top right
		if (row - i >= 0 && col + i < 8) {
			const top_right = boardState[getSquareIndex(row - i, col + i)];

			if (
				top_right.piece == null &&
				hasDiagonalLineOfSight(boardState, top_right, bishopBoardSquare)
			) {
				moves.push(top_right);
			}
		}

		/// bottom left
		if (row + i < 8 && col - i >= 0) {
			const bottom_left = boardState[getSquareIndex(row + i, col - i)];

			if (
				bottom_left.piece == null &&
				hasDiagonalLineOfSight(boardState, bottom_left, bishopBoardSquare)
			) {
				moves.push(bottom_left);
			}
		}

		/// bottom right
		if (row + i < 8 && col + i < 8) {
			const bottom_right = boardState[getSquareIndex(row + i, col + i)];

			if (
				bottom_right.piece == null &&
				hasDiagonalLineOfSight(boardState, bottom_right, bishopBoardSquare)
			) {
				moves.push(bottom_right);
			}
		}
	}

	return moves;
}

export function getValidQueenMoves(
	boardState: Square[],
	queenSquare: HTMLElement,
): Square[] {
	return [
		...getValidRookMoves(boardState, queenSquare),
		...getValidBishopMoves(boardState, queenSquare),
	];
}
