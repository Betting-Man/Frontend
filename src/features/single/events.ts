import type { State } from "./singleSlice";

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
	// 여러 명이 한꺼번에 걸면 라운드를 시작할 때 내는 초기 베팅이다
	if (bettors.length > 1) return [];
	return changed.flatMap(({ user, was }) => {
		const label = user.currentRoundBehavior;
		if (user.currentRoundBet > was.currentRoundBet)
			return [`${user.name} ${typeof label === "number" ? "BET" : label} ${user.currentRoundBet}`];
		if (label !== was.currentRoundBehavior && (label === "CHECK" || label === "DIE"))
			return [`${user.name} ${label}`];
		return [];
	});
}
