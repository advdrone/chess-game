export function getDomSquareFromBoardSquare(row: number, col: number) {
	return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}