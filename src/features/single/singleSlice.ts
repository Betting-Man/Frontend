import { createSlice } from "@reduxjs/toolkit";

export const singleSlice = createSlice({
	name: "single",
	initialState: {
		userTurnOrder: [], // 유저의 턴을 가리키는 배열
		users: [], // 유저 객체의 배열
		userCount: 0, // 유저 수
		initialBet: 0, // 초기 베팅 필수 금액
	},
	reducers: {
		// 유저 수 상태 업데이트
		setUserCount: (state, action) => {
			state.userCount = action.payload;
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
		
	},
});

export const { setUserCount, setInitialBet,setUserTurnOrder, setUsers } = singleSlice.actions;

export default singleSlice.reducer;
