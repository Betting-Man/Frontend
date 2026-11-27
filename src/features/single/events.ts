import { behaviorText } from "./behaviorText";
import type { State } from "./singleSlice";

export const NEEDS_WINNER = "베팅이 끝났어요. 승자를 선택할 차례예요.";

// 승부에 남은 사람: 다이하지 않았고, 칩이 없어 빠진 사람도 아니다 (올인한 사람은 남는다)
const contenders = (state: State) =>
	state.users.filter(
		(user) => user.currentRoundBehavior !== "DIE" && !(user.isDie && user.currentRoundBehavior !== "ALL-IN")
	);
// 아직 베팅할 수 있는 사람이 모두 콜 금액을 맞췄는지
const allCalled = (state: State) =>
	contenders(state)
		.filter((user) => !user.isDie)
		.every((user) => user.currentRoundBet === state.requiredCallScore);

// 더 베팅할 상대가 없어 승자를 골라야 하는지 알려 준다: 한 명만 남았거나, 베팅할 수 있는 사람이 한 명 이하다.
// 여러 명이 한 바퀴를 다 돌아 끝난 경우는 상태만으로 알 수 없어 describeEvents 가 앞뒤 상태로 알아낸다.
export function needsWinner(state: State): boolean {
	if (state.currentRoundTotalScore === 0) return false;
	const left = contenders(state);
	return left.length <= 1 || (left.filter((user) => !user.isDie).length <= 1 && allCalled(state));
}

// 상태가 바뀔 때 누가 무엇을 했는지 한 줄씩 알려 준다. 화면 위 알림에 쓴다.
// 참가자 화면은 방장이 보낸 상태만 받으므로, 액션이 아니라 앞뒤 상태를 견줘서 알아낸다.
export function describeEvents(before: State, after: State): string[] {
	// 게임을 시작하거나 방에 들어온 순간에는 견줄 이전 상태가 없다
	if (before.users.length !== after.users.length) return [];
	const changed = after.users.map((user, index) => ({ user, was: before.users[index] }));

	const charges = changed
		.filter(({ user, was }) => user.initialScore > was.initialScore)
		.map(({ user, was }) => `${user.name} 충전 +${user.initialScore - was.initialScore}`);
	if (charges.length) return charges;

	// 팟이 줄면서 점수가 오른 사람이 승자다
	if (after.currentRoundTotalScore < before.currentRoundTotalScore)
		return changed
			.filter(({ user, was }) => user.currentScore > was.currentScore)
			.map(({ user, was }) => `${user.name} 승리 +${user.currentScore - was.currentScore}`);

	const bettors = changed.filter(({ user, was }) => user.currentRoundBet > was.currentRoundBet);
	// 여러 명이 한꺼번에 걸면 라운드를 시작할 때 내는 기본금이다
	if (bettors.length > 1) return [];

	// 마지막 차례인 사람이 행동해 턴이 한 바퀴 돌았다. 이때 리듀서가 행동 라벨을 0 으로 지운다.
	const last = before.userTurnOrder.length === 1 ? before.userTurnOrder[0] : -1;
	const wrapped = last >= 0 && after.userTurnOrder.length > 1;

	const actions = changed.flatMap(({ user, was }, index) => {
		const label = user.currentRoundBehavior;
		if (user.currentRoundBet > was.currentRoundBet) {
			// 라벨이 지워졌으면 콜이다. 레이즈였다면 턴이 돌지 않아 금액이 남는다.
			const text = label === 0 ? "콜" : typeof label === "number" ? "베팅" : behaviorText(label);
			return [`${user.name} ${text} ${user.currentRoundBet}`];
		}
		if (label !== was.currentRoundBehavior && (label === "CHECK" || label === "DIE"))
			return [`${user.name} ${behaviorText(label)}`];
		if (wrapped && index === last && label === 0) return [`${user.name} 체크`];
		return [];
	});
	// 방금 베팅이 끝났으면 승자를 고르라고 한 번 알린다
	const closed = (wrapped && allCalled(after)) || (needsWinner(after) && !needsWinner(before));
	return closed ? [...actions, NEEDS_WINNER] : actions;
}
