import { describeEvents } from "./events";
import reducer, {
	type State,
	AllIn,
	CheckOrCall,
	betScore,
	dieUser,
	divideRoundScoreToWinner,
	incrementUserCurrentRoundBehavior,
	incrementUserScore,
	startGame,
} from "./singleSlice";

type Action = Parameters<typeof reducer>[1];
let state: State;
// 액션을 실행하고 그 한 번의 변화에서 나온 알림을 돌려준다
const act = (action: Action) => {
	const before = state;
	state = reducer(state, action);
	return describeEvents(before, state);
};

beforeEach(() => {
	state = reducer(undefined, { type: "init" });
	startGame(((action: Action) => (state = reducer(state, action))) as never, ["Hana", "Duri", "Sena"], 5000, 50);
});

test("칩을 고르는 동안에는 알리지 않고, BET 하면 건 금액을 알린다", () => {
	expect(act(incrementUserCurrentRoundBehavior(500))).toEqual([]);
	expect(act(betScore())).toEqual(["Hana BET 550"]);
});

test("콜·체크·다이·올인을 알린다", () => {
	act(incrementUserCurrentRoundBehavior(500));
	act(betScore());
	expect(act(CheckOrCall())).toEqual(["Duri CALL 550"]);
	expect(act(dieUser())).toEqual(["Sena DIE"]);
	act(AllIn());
	expect(act(betScore())).toEqual(["Hana ALL-IN 5000"]);
});

test("체크를 알린다", () => {
	expect(act(CheckOrCall())).toEqual(["Hana CHECK"]);
});

test("승자와 딴 금액을 알린다", () => {
	act(CheckOrCall());
	expect(act(divideRoundScoreToWinner([1]))).toEqual(["Duri 승리 +100"]);
});

test("충전을 알린다", () => {
	expect(act(incrementUserScore({ indexes: [2], amount: 2000 }))).toEqual(["Sena 충전 +2000"]);
});

test("게임을 시작할 때는 알리지 않는다", () => {
	expect(describeEvents(reducer(undefined, { type: "init" }), state)).toEqual([]);
});
