import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type MultiState = {
	role: "local" | "host" | "guest"; // local: 한 기기 모드
	seat: number | null; // 내 자리 - users 배열의 인덱스
	code: string | null; // 방 코드
	players: string[]; // 대기실에 들어온 순서 = 자리 순서
	started: boolean; // 게임 시작 여부
	status: "idle" | "connecting" | "connected" | "error";
	error: string | null;
};

const initialState: MultiState = {
	role: "local",
	seat: null,
	code: null,
	players: [],
	started: false,
	status: "idle",
	error: null,
};

export const multiSlice = createSlice({
	name: "multi",
	initialState,
	reducers: {
		setMulti: (state, action: PayloadAction<Partial<MultiState>>) => ({
			...state,
			...action.payload,
		}),
		resetMulti: () => initialState,
	},
});

export const { setMulti, resetMulti } = multiSlice.actions;
export default multiSlice.reducer;
