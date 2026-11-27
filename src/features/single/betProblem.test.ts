import { betProblem } from "./betProblem";
import reducer, {
	type State,
	AllIn,
	CheckOrCall,
	betScore,
	incrementUserCurrentRoundBehavior,
	setInitialBet,
	setInitialRoundSetting,
	setInitialScore,
	setUserTurnOrder,
	setUsers,
} from "./singleSlice";

type Action = Parameters<typeof reducer>[1];
const play = (scores: number[], actions: Action[]) =>
	[
		setInitialBet(50),
		setUsers(
			scores.map((score, i) => ({
				name: `user${i}`,
				initialScore: score,
				currentScore: score,
				isTurn: false,
				currentRoundBet: 50,
				currentRoundBehavior: 0,
				isDie: false,
			}))
		),
		setUserTurnOrder(),
		setInitialRoundSetting(),
		setInitialScore(scores[0]),
		...actions,
	].reduce(reducer, undefined as unknown as State);

test("칩을 고르지 않고 BET 하면 이유를 알려 준다", () => {
	expect(betProblem(play([5000, 5000], []), "bet")).toBe("걸 칩을 먼저 고르세요.");
});

test("콜 금액 이하로 BET 하면 금액을 알려 준다", () => {
	// 유저0 이 1000 을 걸어 콜 금액이 1050 이 된 뒤, 유저1 이 500 만 고른다
	const state = play([5000, 5000], [
		incrementUserCurrentRoundBehavior(1000),
		betScore(),
		incrementUserCurrentRoundBehavior(500),
	]);
	expect(betProblem(state, "bet")).toContain("콜 금액 1050보다");
	expect(betProblem(state, "bet")).toContain("지금은 550");
});

test("콜 금액보다 많이 고르면 문제가 없다", () => {
	const state = play([5000, 5000], [incrementUserCurrentRoundBehavior(100)]);
	expect(betProblem(state, "bet")).toBeNull();
});

test("남은 칩 이상을 고르면 올인으로 바뀐다고 알려 준다", () => {
	expect(betProblem(play([600, 5000], []), "chip", 1000)).toBe("남은 칩이 550이라 올인으로 바뀌었어요.");
});

test("올인을 고른 뒤 칩을 누르면 취소를 안내한다", () => {
	expect(betProblem(play([5000, 5000], [AllIn()]), "chip", 100)).toContain("취소");
});

test("베팅할 사람이 없으면 승자를 고르라고 알려 준다", () => {
	// 둘 다 올인하면 더 베팅할 사람이 없다
	const state = play([5000, 5000], [AllIn(), betScore(), AllIn(), betScore()]);
	expect(betProblem(state, "other")).toContain("승자 선택");
});

test("콜한 사람이 레이즈를 받고 다시 칩을 고를 수 있다", () => {
	// 유저0 체크, 유저1 500 레이즈, 유저0 턴이 다시 온다
	const state = play([5000, 5000], [
		CheckOrCall(), // 유저0 CHECK 라벨이 남는다
		incrementUserCurrentRoundBehavior(500),
		betScore(), // 유저1 레이즈 → 유저0 턴
		incrementUserCurrentRoundBehavior(1000),
	]);
	expect(state.users[0].currentRoundBehavior).toBe(1000);
});
