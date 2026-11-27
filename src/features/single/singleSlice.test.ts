import reducer, {
	AllIn,
	CheckOrCall,
	State,
	User,
	betScore,
	dieUser,
	divideRoundScoreToWinner,
	incrementRound,
	incrementUserCurrentRoundBehavior,
	setInitialBet,
	setInitialRoundSetting,
	setInitialScore,
	setUserTurnOrder,
	setUsers,
} from "./singleSlice";

type Action = Parameters<typeof reducer>[1];

const run = (state: State | undefined, actions: Action[]) =>
	actions.reduce(reducer, state as State);

// SingleBeginModal 의 handleOk 와 같은 순서로 게임을 시작한다
const startGame = (scores: number[], initialBet: number, prev?: State) => {
	const users: User[] = scores.map((score, i) => ({
		name: `user${i}`,
		initialScore: score,
		currentScore: score,
		isTurn: false,
		currentRoundBet: initialBet,
		currentRoundBehavior: 0,
		isDie: false,
	}));
	return run(prev, [
		setInitialBet(initialBet),
		setUsers(users),
		setUserTurnOrder(),
		setInitialRoundSetting(),
		setInitialScore(scores[0]),
	]);
};

const scores = (state: State) => state.users.map((user) => user.currentScore);
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

beforeEach(() => {
	window.alert = vi.fn();
});

test("정상: 3인이 같은 금액을 콜하고 1명이 이기면 점수 합계가 보존된다", () => {
	const state = run(startGame([5000, 5000, 5000], 50), [
		incrementUserCurrentRoundBehavior(500),
		betScore(),
		CheckOrCall(),
		CheckOrCall(),
		divideRoundScoreToWinner([1]),
	]);

	expect(scores(state)).toEqual([4450, 6100, 4450]);
	expect(window.alert).not.toHaveBeenCalled();
});

test("A: 올인 레이즈를 받을 상대가 없어도 예외가 나지 않는다", () => {
	const state = run(startGame([3000, 5000], 0), [AllIn(), betScore(), AllIn()]);

	expect(() => reducer(state, betScore())).not.toThrow();
});

test("B: 베팅액 0인 유저가 있어도 숏 올인 승자가 팟을 받는다", () => {
	const state = run(startGame([1000, 1000, 300], 0), [
		dieUser(), // 유저0 다이 (베팅 0)
		incrementUserCurrentRoundBehavior(500),
		betScore(), // 유저1 500 베팅
		CheckOrCall(), // 유저2 300 올인
		divideRoundScoreToWinner([2]),
	]);

	expect(scores(state)).toEqual([1000, 700, 600]);
	expect(window.alert).not.toHaveBeenCalled();
});

describe("C: 새 게임을 시작하면 이전 게임 상태가 남지 않는다", () => {
	// 8인 게임에서 턴 순서상 6번째인 유저6이 이긴 뒤 2인 게임을 새로 시작한다
	const newGame = () => {
		const previous = run(startGame(Array(8).fill(5000), 50), [
			divideRoundScoreToWinner([6]),
			incrementRound(),
		]);
		return startGame([5000, 5000], 50, previous);
	};

	test("첫 승자 선택에서 예외가 나지 않는다", () => {
		const state = newGame();

		expect(() => reducer(state, divideRoundScoreToWinner([0]))).not.toThrow();
	});

	test("라운드가 1부터 시작한다", () => {
		expect(newGame().round).toBe(1);
	});
});

test("F: 칩으로 남은 점수를 정확히 걸면 올인이 된다", () => {
	const state = run(
		startGame([5000, 5000], 0),
		Array(5).fill(incrementUserCurrentRoundBehavior(1000))
	);

	expect(state.users[0].currentRoundBehavior).toBe("ALL-IN");
});

test("G: 승자 3명이 팟을 나눠도 점수가 정수이고 합계가 보존된다", () => {
	const state = run(startGame(Array(5).fill(5000), 50), [
		divideRoundScoreToWinner([0, 1, 2]),
	]);

	expect(scores(state).every(Number.isInteger)).toBe(true);
	expect(sum(scores(state))).toBe(25000);
});

test("H: 초기 베팅이 0이어도 0점 유저는 다음 라운드 턴을 받지 않는다", () => {
	const state = run(startGame([1000, 1000], 0), [
		AllIn(),
		betScore(),
		CheckOrCall(),
		divideRoundScoreToWinner([0]),
	]);

	expect(scores(state)).toEqual([2000, 0]);
	expect(state.userTurnOrder).not.toContain(1);
});
