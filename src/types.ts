import { Piece } from "./pieces";

export type Square = {
	x: number;
	y: number;
	piece: Piece | null;
};
