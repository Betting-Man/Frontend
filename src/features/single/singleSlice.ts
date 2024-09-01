import { createSlice } from "@reduxjs/toolkit";

export type User = {
    name: string,
    initialScore: number,
    currentScore: number,
    isTurn : boolean,
    currentRoundBet: number,
    currentRoundBehavior : string
}

export const singleSlice = createSlice({
	name: "single",
	initialState: {
		userTurnOrder: [], // 유저의 턴을 가리키는 배열
		users : [], // 유저 객체의 배열
		userNames: [] as string[],
		userCount: 0, // 유저 수
		initialBet: 0, // 초기 베팅 필수 금액
		round: 1, // 라운드 수
		currentRoundTotalScore: 0, // 해당 라운드에 걸린 금액
	},
	reducers: {
		// 유저 수 상태 업데이트
		setUserCount: (state, action) => {
			state.userCount = action.payload;
			state.userNames = Array(action.payload).fill('');
		},
		// 유저 이름 업데이트
		updateUserName: (state, action: { payload: [number, string] }) => {
			const [index, newName] = action.payload;
			state.userNames[index] = newName;
		},
		// 유저 수 상태 초기화
		resetUserCount: (state) => {
			state.userCount = 0;
		},
		// 게임의 초기 베팅 필수 금액 업데이트
		setInitialBet: (state, action) => {
			state.initialBet = action.payload;
		},
		// 유저 정보 업데이트
		setUsers: (state, action) => {
			state.users = action.payload;
		},
		// 유저의 턴 상태 관리
		setUserTurnOrder: (state, action) => {
			state.userTurnOrder = action.payload;
		},
		// 라운드 수 늘리기
		incrementRound: (state) => {
			state.round += 1;
		},
		// 라운드에 걸린 금액 초기화
		resetCurrentRoundTotalScore: (state) => {
			state.currentRoundTotalScore = 0;
		},
		// 라운드에 걸린 금액 더하기
		incrementCurrentRoundTotalScore: (state, action) => {
			state.currentRoundTotalScore += action.payload;
		},
	},
});

export const {
	setUserCount,
	updateUserName,
	resetUserCount,
	setInitialBet,
	setUsers,
	setUserTurnOrder,
	incrementRound,
	resetCurrentRoundTotalScore,
	incrementCurrentRoundTotalScore,
} = singleSlice.actions;

export default singleSlice.reducer;
