import reducer, {
	AllIn,
	CheckOrCall,
	State,
	User,
	betScore,
	dieUser,
	divideRoundScoreToWinner,
	incrementRound,
	incrementUserScore,
	resetAllUserCurrentRoundBehavior,
	resetRequiredCallScore,
	resetUserCurrentRoundBehavior,
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

test("K: 라운드 중간에 충전해도 턴과 베팅이 그대로다", () => {
	const before = run(startGame([5000, 5000, 5000], 50), [
		incrementUserCurrentRoundBehavior(500),
		betScore(), // 유저0 500 베팅, 유저1 턴
	]);
	const state = reducer(before, incrementUserScore({ indexes: [2], amount: 5000 }));

	expect(scores(state)).toEqual([5000, 5000, 10000]);
	expect(state.userTurnOrder).toEqual(before.userTurnOrder);
	expect(state.users.map((user) => user.currentRoundBet)).toEqual([550, 50, 50]);
	expect(state.currentRoundTotalScore).toBe(650);
	expect(state.requiredCallScore).toBe(550);
});

// 결과 명세서(Result)는 currentScore - initialScore 다. 합계가 0 이어야 정확하다.
test("L: 무작위로 여러 판을 해도 점수가 새거나 생기지 않는다", () => {
	// 시드 고정 난수 - 실패하면 같은 순서로 다시 재현된다
	let seed = 20261128;
	const random = (max: number) => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed % max;
	};

	let settled = 0;
	let uneven = 0; // 건 금액이 서로 다른 채로 정산한 횟수
	for (let game = 0; game < 200; game++) {
		const count = 2 + random(7);
		let state = startGame(Array(count).fill(5000), random(2) * 50);
		const label = `game ${game}`;

		for (let step = 0; step < 300; step++) {
			const roll = random(100);
			const alive = state.users.flatMap((user, index) => (user.isDie ? [] : [index]));
			// 턴이 다 돌았거나 가끔: 살아 있는 사람 중 승자를 골라 정산한다 (SingleWinnerModal 과 같은 순서)
			if (alive.length && (state.userTurnOrder.length === 0 || roll < 8)) {
				const winners = alive.filter(() => random(3) === 0);
				settled++;
				if (new Set(state.users.map((user) => user.currentRoundBet).filter(Boolean)).size > 1) uneven++;
				state = run(state, [
					divideRoundScoreToWinner(winners.length ? winners : [alive[random(alive.length)]]),
					resetRequiredCallScore(),
					setInitialRoundSetting(),
					resetAllUserCurrentRoundBehavior(),
					incrementRound(),
				]);
				const all = state.users.map((user) => user.currentScore);
				expect(all.every(Number.isInteger), label).toBe(true);
				expect(Math.min(...all), label).toBeGreaterThanOrEqual(0);
				expect(sum(all), label).toBe(sum(state.users.map((user) => user.initialScore)));
			} else if (roll < 12) state = reducer(state, incrementUserScore({ indexes: [random(count)], amount: 1000 * (1 + random(10)) }));
			else if (roll < 40) state = reducer(state, incrementUserCurrentRoundBehavior([100, 500, 1000][random(3)]));
			else if (roll < 55) state = reducer(state, betScore());
			else if (roll < 80) state = reducer(state, CheckOrCall());
			else if (roll < 86) state = reducer(state, AllIn());
			else if (roll < 90) state = reducer(state, resetUserCurrentRoundBehavior());
			else state = reducer(state, dieUser());
		}
	}
	expect(window.alert).not.toHaveBeenCalled();
	// 시험이 비어 있지 않은지 확인한다
	expect(settled).toBeGreaterThan(1000);
	expect(uneven).toBeGreaterThan(100);
});

test("M: 충전 금액을 정할 수 있고, 잘못된 금액은 무시한다", () => {
	const start = startGame([5000, 5000], 50);
	expect(scores(reducer(start, incrementUserScore({ indexes: [1], amount: 2000 })))).toEqual([5000, 7000]);
	for (const amount of [0, -1000, 75, 1.5, NaN, 10_000_000])
		expect(scores(reducer(start, incrementUserScore({ indexes: [1], amount })))).toEqual([5000, 5000]);
});
