import { getDomSquareFromBoardSquare } from "./helper";
import { Square } from "./types";

function getSquareIndex(row: number, col: number): number {
	return row * 8 + col;
}

export function simulateMove(boardState: Square[], playerTurn: string, square_from: HTMLElement, square_to: HTMLElement) {
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

	// check for a diagonal capture on the left for either side (-1 or +1 row)

	if (row + direction >= 0 && row + direction < 8 && col - 1 >= 0) {
		const leftDiagonalCapture =
			boardState[getSquareIndex(row + direction, col - 1)];

		if (
			leftDiagonalCapture.piece &&
			leftDiagonalCapture.piece.color != squareState.piece?.color
		) {
			moves.push(leftDiagonalCapture);
		}
	}

	// check for a diagonal capture on the right for either side (-1 or +1 row)

	if (row + direction >= 0 && row + direction < 8 && col + 1 < 8) {
		const rightDiagonalCapture =
			boardState[getSquareIndex(row + direction, col + 1)];

		if (
			rightDiagonalCapture.piece &&
			rightDiagonalCapture.piece.color != squareState.piece?.color
		) {
			moves.push(rightDiagonalCapture);
		}
	}

	const offset1 = boardState[getSquareIndex(row + direction, col)];
	const offset2 = boardState[getSquareIndex(row + 2 * direction, col)];

	if (row + direction > 0 && row + direction < 8 && offset1.piece == null) {
		moves.push(offset1);
	}

	if (
		row + 2 * direction >= 0 &&
		row + 2 * direction < 8 &&
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
		{ row: row + 2, col: col - 1 },
		{ row: row + 2, col: col + 1 },
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

export function hasRowLineOfSight(
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

export function hasColLineOfSight( // squares guaranteed to be same column, different rows
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

function canCastle(boardState: Square[], playerTurn: string, kingSquare: HTMLElement, rookSquare: HTMLElement) {
	const kingSquareIndex = getSquareIndex(
		Number(kingSquare.dataset.row),
		Number(kingSquare.dataset.col),
	);

	const rookSquareIndex = getSquareIndex(
		Number(rookSquare.dataset.row),
		Number(rookSquare.dataset.col),
	);

	const kingSquareState = boardState[kingSquareIndex];
	const rookSquareState = boardState[rookSquareIndex];

	const castleDirection = kingSquareState.x > rookSquareState.x ? "left" : "right"

	if (!kingSquareState.piece || !rookSquareState.piece) {
		return false;
	}

	// no pieces should have moved

	if (kingSquareState.piece.hasMoved || rookSquareState.piece.hasMoved) {
		console.log("One of them has moved, FALSE");

		return false
	}

	// do they have a line of sight?

	if (!hasRowLineOfSight(boardState, kingSquareState, rookSquareState)) {
		console.log("Line of sight, FALSE");

		return false
	}

	// are they in check?

	if (determineIfInCheck(boardState, kingSquare)) {
		console.log("King in check, FALSE");

		return false
	}

	const leftCastleSquare = boardState[kingSquareIndex - 2]
	const rightCastleSquare = boardState[kingSquareIndex + 2]

	if (castleDirection == "left" && simulateMove(boardState, playerTurn, kingSquare, getDomSquareFromBoardSquare(leftCastleSquare.y, leftCastleSquare.x))) {
		console.log("CAN CASTLE LEFT")
		return true
	}

	if (castleDirection == "right" && simulateMove(boardState, playerTurn, kingSquare, getDomSquareFromBoardSquare(rightCastleSquare.y, rightCastleSquare.x))) {
		console.log("CAN CASTLE RIGHT")
		return true
	}
}


export function getValidKingMoves(
	boardState: Square[],
	kingSquare: HTMLElement,
): Square[] {
	let moves = [];

	const row = Number(kingSquare.dataset.row);
	const col = Number(kingSquare.dataset.col);

	const kingSquareIndex = getSquareIndex(row, col);
	const kingSquareState = boardState[kingSquareIndex];

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

	const canCastleRight = canCastle(boardState, kingSquareState.piece?.color, kingSquare, getDomSquareFromBoardSquare(
		kingSquareState.y,
		kingSquareState.x + 3,
	))

	const canCastleLeft = canCastle(boardState, kingSquareState.piece?.color, kingSquare, getDomSquareFromBoardSquare(
		kingSquareState.y,
		kingSquareState.x - 4,
	))

	if (canCastleLeft) {
		potentialMoves.push({row: row, col: col - 2})
	}

	if (canCastleRight) {
		potentialMoves.push({ row: row, col: col + 2})
	}

	for (const move of potentialMoves) {
		if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
			const targetSquareState = boardState[getSquareIndex(move.row, move.col)];

			if (
				(targetSquareState.piece &&
					targetSquareState.piece.color != kingSquareState.piece?.color) ||
				targetSquareState.piece == null
			) {
				moves.push(targetSquareState);
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

	// end points excluded so it only gets squares in between

	// case 1: square a is to the top left of square b, meaning square a has lower row and col

	if (square_a_row < square_b_row && square_a_col < square_b_col) {
		for (
			let i = getSquareIndex(square_a_row, square_a_col) + 9;
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
			let i = getSquareIndex(square_a_row, square_a_col) + 7;
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
			let i = getSquareIndex(square_a_row, square_a_col) - 7;
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
			let i = getSquareIndex(square_a_row, square_a_col) - 9;
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

			if (hasDiagonalLineOfSight(boardState, top_left, bishopBoardSquare)) {
				if (
					(top_left.piece &&
						top_left.piece.color != bishopBoardSquare.piece?.color) ||
					top_left.piece == null
				) {
					moves.push(top_left);
				}
			}
		}

		/// top right
		if (row - i >= 0 && col + i < 8) {
			const top_right = boardState[getSquareIndex(row - i, col + i)];

			if (hasDiagonalLineOfSight(boardState, top_right, bishopBoardSquare)) {
				if (
					(top_right.piece &&
						top_right.piece.color != bishopBoardSquare.piece?.color) ||
					top_right.piece == null
				) {
					moves.push(top_right);
				}
			}
		}

		/// bottom left
		if (row + i < 8 && col - i >= 0) {
			const bottom_left = boardState[getSquareIndex(row + i, col - i)];

			if (hasDiagonalLineOfSight(boardState, bottom_left, bishopBoardSquare)) {
				if (
					(bottom_left.piece &&
						bottom_left.piece.color != bishopBoardSquare.piece?.color) ||
					bottom_left.piece == null
				) {
					moves.push(bottom_left);
				}
			}
		}

		/// bottom right
		if (row + i < 8 && col + i < 8) {
			const bottom_right = boardState[getSquareIndex(row + i, col + i)];

			if (hasDiagonalLineOfSight(boardState, bottom_right, bishopBoardSquare)) {
				if (
					(bottom_right.piece &&
						bottom_right.piece.color != bishopBoardSquare.piece?.color) ||
					bottom_right.piece == null
				) {
					moves.push(bottom_right);
				}
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

export function getKingSquare(boardState: Square[], color: string): Square {
	for (let i = 0; i < 64; i++) {
		if (
			boardState[i].piece?.type == "king" &&
			boardState[i].piece?.color == color
		) {
			return boardState[i];
		}
	}

	throw new Error(`The ${color} king is not found on board`);
}

export function determineIfInCheck(
	boardState: Square[],
	kingSquare: HTMLElement,
): Boolean {
	const row = Number(kingSquare.dataset.row);
	const col = Number(kingSquare.dataset.col);

	const kingSquareIndex = getSquareIndex(row, col);
	const kingSquareState = boardState[kingSquareIndex];

	for (let i = 0; i < 64; i++) {
		const squareState = boardState[i];

		const domSquare = document.querySelector(
			`[data-row="${squareState.y}"][data-col="${squareState.x}"]`,
		) as HTMLElement;

		if (squareState.piece?.color != kingSquareState.piece?.color) {
			const pieceType = squareState.piece?.type;

			let moves: Square[] = [];

			if (pieceType == "pawn") {
				moves = getValidPawnMoves(boardState, domSquare);
			} else if (pieceType == "bishop") {
				moves = getValidBishopMoves(boardState, domSquare);
			} else if (pieceType == "knight") {
				moves = getValidKnightMoves(boardState, domSquare);
			} else if (pieceType == "rook") {
				moves = getValidRookMoves(boardState, domSquare);
			} else if (pieceType == "queen") {
				moves = getValidQueenMoves(boardState, domSquare);
			}

			for (const move of moves) {
				if (move.x == col && move.y == row) {
					console.log("King is in check!");
					return true;
				}
			}
		}
	}

	return false;
}
