import reducer, {
	type State,
	betScore,
	divideRoundScoreToWinner,
	incrementUserCurrentRoundBehavior,
	startGame,
} from "../single/singleSlice";
import { isAllowed } from "./isAllowed";

let state: State;

beforeEach(() => {
	state = reducer(undefined, { type: "init" });
	startGame(
		((action: Parameters<typeof reducer>[1]) => {
			state = reducer(state, action);
			return action;
		}) as never,
		["host", "guest"],
		5000,
		50
	);
});

test("자기 턴인 참가자의 베팅 액션은 허용한다", () => {
	expect(isAllowed(state, 0, betScore())).toBe(true);
	expect(isAllowed(state, 0, incrementUserCurrentRoundBehavior(500))).toBe(true);
});

test("자기 턴이 아닌 참가자의 액션은 거부한다", () => {
	expect(isAllowed(state, 1, betScore())).toBe(false);
});

test("자리가 없는 연결의 액션은 거부한다", () => {
	expect(isAllowed(state, -1, betScore())).toBe(false);
});

test("베팅이 아닌 액션은 거부한다", () => {
	expect(isAllowed(state, 0, divideRoundScoreToWinner([0]))).toBe(false);
	expect(isAllowed(state, 0, { type: "single/replaceState", payload: {} })).toBe(false);
});

test("칩 버튼에 없는 금액은 거부한다", () => {
	expect(isAllowed(state, 0, incrementUserCurrentRoundBehavior(-99999))).toBe(false);
});
