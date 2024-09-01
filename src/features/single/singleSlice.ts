import { createSlice } from "@reduxjs/toolkit";

export type User = {
	name: string;
	initialScore: number;
	currentScore: number;
	isTurn: boolean;
	currentRoundBet: number;
	currentRoundBehavior: string;
	isDie: boolean;
};

export const singleSlice = createSlice({
	name: "single",
	initialState: {
		userTurnOrder: [] as User[], // 유저의 턴을 가리키는 배열
		userTurnName: [] as string[], // 유저의 턴을 계산하는데 기준이 되는 배열
		userTurnIndex: 0, // 유저의 턴을 기준 삼기 위한 인덱스
		users: [] as User[], // 유저 객체의 배열
		userNames: [] as string[], // 유저 이름 배열
		userCount: 0, // 유저 수
		initialBet: 0, // 초기 베팅 필수 금액
		round: 1, // 라운드 수
		currentRoundTotalScore: 0, // 해당 라운드에 걸린 금액
		callScore: 0, // 콜하기 위한 금액
	},
	reducers: {
		// 유저 수 상태 업데이트
		setUserCount: (state, action) => {
			state.userCount = action.payload;
			state.userNames = Array(action.payload).fill("");
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
		// 유저 턴 상태 관리
		// 1.users 배열 시계방향에 맞게 턴에 추가
		// 2-1. call/die 하면 배열에서 삭제
		// 2-2. 추가 bet 하면 index 고치고 die를 제외한 나머지 user를 뒤에 추가 // 시작 점을 기준으로 하는 index나 값이 필요

		// 3. 누군가 승리로 끝나면 다시 배열에 users들 추가

		// users 배열 시계방향에 맞게 턴에 추가
		setUserTurnOrder: (state) => {
			// 첫 번째 사용자의 이름과 객체 추가
			state.userTurnName.push(state.users[0].name);
			state.userTurnOrder.push(state.users[0]);

			// 홀수 인덱스의 사용자들 추가 (1, 3, 5, ...)
			for (let i = 1; i < state.users.length; i += 2) {
				state.userTurnName.push(state.users[i].name);
				state.userTurnOrder.push(state.users[i]);
			}

			// 짝수 인덱스의 사용자들 추가 (2, 4, 6, ...)
			for (let i = 2; i < state.users.length; i += 2) {
				state.userTurnName.push(state.users[i].name);
				state.userTurnOrder.push(state.users[i]);
			}
			state.userTurnOrder[0].isTurn=true;
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
