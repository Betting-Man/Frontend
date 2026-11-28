import { NEEDS_WINNER, describeEvents, needsWinner } from "./events";
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
	expect(act(betScore())).toEqual(["Hana 베팅 550"]);
});

test("콜·체크·다이·올인을 알린다", () => {
	act(incrementUserCurrentRoundBehavior(500));
	act(betScore());
	expect(act(CheckOrCall())).toEqual(["Duri 콜 550"]);
	// 남은 둘이 같은 금액을 걸었으므로 베팅이 끝났다
	expect(act(dieUser())).toEqual(["Sena 다이", NEEDS_WINNER]);
	act(AllIn());
	expect(act(betScore())).toEqual(["Hana 올인 5000"]);
});

test("체크를 알린다", () => {
	expect(act(CheckOrCall())).toEqual(["Hana 체크"]);
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

test("모두 체크하면 승자를 선택하라고 한 번만 알린다", () => {
	expect(needsWinner(state)).toBe(false); // 기본금만 낸 상태
	act(CheckOrCall());
	act(CheckOrCall());
	expect(act(CheckOrCall())).toEqual(["Sena 체크", NEEDS_WINNER]);
	expect(act(incrementUserCurrentRoundBehavior(100))).toEqual([]);
});

test("레이즈를 받은 사람이 남아 있으면 아직 알리지 않는다", () => {
	act(CheckOrCall());
	act(incrementUserCurrentRoundBehavior(500));
	expect(act(betScore())).toEqual(["Duri 베팅 550"]);
	expect(needsWinner(state)).toBe(false);
});

test("한 명만 남으면 승자를 선택하라고 알린다", () => {
	act(dieUser());
	expect(act(dieUser())).toEqual(["Duri 다이", NEEDS_WINNER]);
});
