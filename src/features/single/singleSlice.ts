import { createSlice } from "@reduxjs/toolkit";

// 유저 타입 정의
export type User = {
	name: string;
	initialScore: number;
	currentScore: number;
	isTurn: boolean;
	currentRoundBet: number;
	currentRoundBehavior: string | number ;
	isDie: boolean;
};

// State 타입 정의
export type State = {
	userTurnOrder: number[]; // 유저의 턴 배열 - 턴에 맞는 유저의 인덱스가 적혀있음
	userTurnStandard: number[]; // 유저의 턴을 계산하는데 기준이 되는 배열
	userTurnIndex: number; // 유저의 턴을 기준 삼기 위한 인덱스
	users: User[]; // 유저 객체의 배열
	userNames: string[]; // 유저 이름 배열
	userCount: number; // 유저 수
	initialBet: number; // 초기 베팅 필수 금액
	round: number; // 라운드 수
	currentRoundTotalScore: number; // 해당 라운드에 걸린 금액
	requiredCallScore: number; // 콜하기 위한 금액
};

// 초기 상태
const initialState: State = {
	userTurnOrder: [], // 유저의 턴을 가리키는 배열
	userTurnStandard: [], // 유저의 턴을 계산하는데 기준이 되는 배열
	userTurnIndex: 0, // 유저의 턴을 기준 삼기 위한 인덱스
	users: [], // 유저 객체의 배열
	userNames: [], // 유저 이름 배열
	userCount: 0, // 유저 수
	initialBet: 0, // 초기 베팅 필수 금액
	round: 1, // 라운드 수
	currentRoundTotalScore: 0, // 해당 라운드에 걸린 금액
	requiredCallScore: 0, // 콜하기 위한 금액
};

// 헬퍼 함수: 턴 넘기기 로직
function turnOver(state: State) {
	// 턴 종료
	state.users[state.userTurnOrder[0]].isTurn = false;
	// 현재 턴을 넘기기 위해 첫 번째 유저를 배열에서 제거
	state.userTurnOrder.shift();
	// userTurnOrder 비어있으면 추가
	if(state.userTurnOrder.length === 0){
		for (let i = 0; i < state.userTurnStandard.length ; i++) {
			const value =state.userTurnStandard[(state.userTurnIndex + i) % state.userTurnStandard.length];
			// 죽지 않은 사람만 추가
			if(state.users[value].isDie===false){
				state.userTurnOrder.push(value);
				// ALL-IN 은 다음 턴이 되어도 유지되게
				if(state.users[value].currentRoundBet===state.users[value].currentScore){
					state.users[value].currentRoundBehavior='ALL-IN';
				}else{
					state.users[value].currentRoundBehavior=0;
				}
			}
		}
	}
	// 모두 죽었을 경우
	if(state.userTurnOrder.length===0){

	}else{
	// 그 다음 유저의 턴을 true로 설정합니다.
	state.users[state.userTurnOrder[0]].isTurn = true;
	}
}

export const singleSlice = createSlice({
	name: "single",
	initialState,
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
			// 초기화
			state.userTurnOrder = [];
			state.userTurnStandard = [];
			// 첫 번째 사용자의 이름과 객체 추가
			state.userTurnStandard.push(0);

			// 홀수 인덱스의 사용자들 추가 (1, 3, 5, ...)
			for (let i = 1; i < state.users.length; i += 2) {
				state.userTurnStandard.push(i);
			}

			const index =
				state.users.length % 2 === 0
					? state.users.length - 2
					: state.users.length - 1;

			// 짝수 인덱스의 사용자들 추가 (2, 4, 6, ...)
			for (let i = index; i > 0; i -= 2) {
				state.userTurnStandard.push(i);
			}

			state.userTurnOrder = state.userTurnStandard;

			// 첫번째 유저 턴
			state.users[state.userTurnOrder[0]].isTurn = true;
		},
		// check나 call 했을 경우
		CheckOrCall: (state) => {
			const currentUser = state.users[state.userTurnOrder[0]];
			// check
			if (currentUser.currentRoundBet === state.requiredCallScore) {
				currentUser.currentRoundBehavior = "CHECK";
			}
			// call
			else {
				// 콜 필요 금액이 자신의 자산보다 높을 경우
				if(currentUser.currentScore <= state.requiredCallScore){
					currentUser.currentRoundBehavior = "ALL-IN";
					state.currentRoundTotalScore +=currentUser.currentScore - currentUser.currentRoundBet;
					currentUser.currentRoundBet = currentUser.currentScore;
					currentUser.isDie=true;
				}
				else{
					currentUser.currentRoundBehavior = "CALL";
					state.currentRoundTotalScore += state.requiredCallScore - currentUser.currentRoundBet;
					currentUser.currentRoundBet = state.requiredCallScore;
				}
			}
			turnOver(state);
		},
		// ALL-IN 눌렀을 경우
		AllIn : (state)=>{
			const currentUser = state.users[state.userTurnOrder[0]];
			currentUser.currentRoundBehavior = "ALL-IN";
		},
		// 금액 베팅 했을 경우
		betScore: (state) => {
			const currentUser = state.users[state.userTurnOrder[0]];

			if (typeof currentUser.currentRoundBehavior === "number") {
				// 금액이 해당 라운드 콜 금액을 넘기는지 확인
				if (
					state.requiredCallScore < currentUser.currentRoundBehavior + currentUser.currentRoundBet
				) {
					currentUser.isTurn=false;
					// 새로운 userTurnOrder에서 첫 번째 유저의 인덱스를 userTurnStandard를 기준으로 찾습니다.
					state.userTurnIndex = state.userTurnStandard.indexOf(
						state.userTurnOrder[0]
					);

					// 유저 턴 변경 및 인덱스 변경
					state.userTurnOrder = [];

					// userTurnStandard에서 bet을 한 유저의 인덱스(userTurnIndex)를 기준으로 배열을 갱신합니다.
					for (let i = 0; i < state.userTurnStandard.length - 1; i++) {
						const value =
							state.userTurnStandard[(state.userTurnIndex + i + 1) % state.userTurnStandard.length];
						// 안죽은 사람만 추가
						if(state.users[value].isDie===false){
							state.userTurnOrder.push(value);
						}
					}

					// 필요 콜 금액 변경
					state.requiredCallScore = currentUser.currentRoundBehavior + currentUser.currentRoundBet;

					// 해당 라운드 금액 추가
					state.currentRoundTotalScore +=
						currentUser.currentRoundBehavior;

					// 해당 유저의 이번 라운드 벳 추가
					currentUser.currentRoundBet +=
						currentUser.currentRoundBehavior;

					// 턴 넘기기
					state.users[state.userTurnOrder[0]].isTurn=true;
				}
			}
			// ALL-IN 일때, BET 했을 경우 
			else if(currentUser.currentRoundBehavior === 'ALL-IN'){
					currentUser.isTurn=false;
					currentUser.isDie=true;
					// 새로운 userTurnOrder에서 첫 번째 유저의 인덱스를 userTurnStandard를 기준으로 찾습니다.
					state.userTurnIndex = state.userTurnStandard.indexOf(
						state.userTurnOrder[0]
					);

					// 유저 턴 변경 및 인덱스 변경
					state.userTurnOrder = [];

					// userTurnStandard에서 bet을 한 유저의 인덱스(userTurnIndex)를 기준으로 배열을 갱신합니다.
					for (let i = 0; i < state.userTurnStandard.length - 1; i++) {
						const value =
							state.userTurnStandard[(state.userTurnIndex + i + 1) % state.userTurnStandard.length];
						// 안죽은 사람만 추가
						if(state.users[value].isDie===false){
							state.userTurnOrder.push(value);
						}
					}

					// 필요 콜 금액 변경
					state.requiredCallScore = currentUser.currentScore;

					// 해당 라운드 금액 추가
					state.currentRoundTotalScore += currentUser.currentScore - currentUser.currentRoundBet;

					// 해당 유저의 이번 라운드 벳 추가
					currentUser.currentRoundBet =currentUser.currentScore;

					// 턴 넘기기
					state.users[state.userTurnOrder[0]].isTurn=true;
			}
		},
		// Die 눌렀을 때
		dieUser: (state) => {
			if(state.userTurnOrder.length>0){
				state.users[state.userTurnOrder[0]].isDie = true;
				state.users[state.userTurnOrder[0]].currentRoundBehavior = "DIE";
				turnOver(state);
			}
		},
		// 현재 턴 유저의 currentRoundBet 추가 - 100,500,1000 눌렀을 때
		incrementUserCurrentRoundBehavior: (state, action: { payload: number }) => {
			// 해당 유저
			const user=state.users[state.userTurnOrder[0]];
			if(typeof user.currentRoundBehavior ==='number' ){
				// 현재 라운드 금액
				const betScore = user.currentRoundBehavior + action.payload;
				// 베팅한 금액이 유저가 가진 금액보다 많을 경우
				if(betScore>user.currentScore){
					// user.currentRoundBehavior=user.currentScore - user.currentRoundBet;
					user.currentRoundBehavior='ALL-IN';
				} else if(betScore + user.currentRoundBet > user.currentScore){
					// user.currentRoundBehavior=user.currentScore - user.currentRoundBet;
					user.currentRoundBehavior='ALL-IN';
				}
				else{
					user.currentRoundBehavior += action.payload;
				}
			}
		},
		// 배열에 있는 유저들에게 해당 라운드 금액 나눠주기
		divideRoundScoreToWinner: (state,action : {payload : number[]}) => {
			const selectedUserIndexes = action.payload;
            const totalScore = state.currentRoundTotalScore; //3050

            // 나누어 줄 수의 크기를 계산합니다.
            const scoreToAdd = totalScore / selectedUserIndexes.length;

            // 선택된 유저들에 대해서 점수를 나눠서 추가합니다.
            selectedUserIndexes.forEach((index: number) => {
                state.users[index].currentScore += (scoreToAdd-state.users[index].currentRoundBet); //3050 - 1050 = 2000
				state.users[index].currentRoundBet = 0;
            });

            // 선택되지 않은 유저들에 대해서 점수를 나눠서 뺍니다.
            state.users.forEach((user, index) => {
                if (!selectedUserIndexes.includes(index)) {
                    user.currentScore -= user.currentRoundBet;
					user.currentRoundBet=0;
                }
            });

			// 유저 턴 정보 배열(userTurnOrder) userTurnIndex에 맞춰서초기화
			state.userTurnOrder=[]; // 배열 초기화
			// index 승자 기준으로 초기화 => 승자 부터 라운드 시작
			state.userTurnIndex=state.userTurnStandard.indexOf(selectedUserIndexes[0]); 
			for (let i = 0; i < state.userTurnStandard.length ; i++) {
				const value =state.userTurnStandard[(state.userTurnIndex + i) % state.userTurnStandard.length];
				state.userTurnOrder.push(value); // 턴 다시 추가
				state.users[value].isTurn=false; // 턴 내용 초기화
				state.users[value].isDie=false; // 턴 내용 초기화
				state.users[value].currentRoundBehavior=0; // 이전에 한 행동 초기화
			}
			// 첫번째 유저 턴 주기
			state.users[state.userTurnOrder[0]].isTurn=true;

            // 라운드 점수 초기화
            state.currentRoundTotalScore = 0;
		},
		// 현재 턴 유저의 currentRoundBehavior 초기화
		resetUserCurrentRoundBehavior: (state) => {
			state.users[state.userTurnOrder[0]].currentRoundBehavior = 0;
		},
		// 모든 유저의 currentBehavior 초기화
		resetAllUserCurrentRoundBehavior: (state) => {
			state.users.forEach((user)=>{
				user.currentRoundBehavior=0;
			})
		},
		// 라운드 인당 콜 금액 초기화
		resetRequiredCallScore: (state) => {
			state.requiredCallScore = 0;
		},
		// 라운드 시작할 때, 초기 금액 설정
		setInitialRoundSetting : (state) =>{
			const initialBet=state.initialBet;
			let survivedUserCount = 0;

			state.users.forEach((user)=>{
				if(user.currentScore>=initialBet){
					user.currentRoundBet=initialBet;
					survivedUserCount++;
				}else{
					user.isDie=true;
				}	
			})

			state.currentRoundTotalScore=initialBet * survivedUserCount;
			state.requiredCallScore=initialBet;
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
	CheckOrCall,
	AllIn,
	betScore,
	dieUser,
	divideRoundScoreToWinner,
	incrementUserCurrentRoundBehavior,
	resetUserCurrentRoundBehavior,
	resetAllUserCurrentRoundBehavior,
	resetRequiredCallScore,
	setInitialRoundSetting,
	incrementRound,
	resetCurrentRoundTotalScore,
	incrementCurrentRoundTotalScore,
} = singleSlice.actions;

export default singleSlice.reducer;
