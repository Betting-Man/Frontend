import type { State } from "./singleSlice";

// 베팅 버튼을 눌렀을 때 그대로 되지 않는 이유를 알려 준다. 문제가 없으면 null.
// action: "chip" = 100·500·1000 칩 버튼, "bet" = BET 버튼, "other" = 나머지 버튼
export function betProblem(state: State, action: "chip" | "bet" | "other", amount = 0): string | null {
	const user = state.users[state.userTurnOrder[0]];
	if (!user) return "모두 베팅을 마쳤어요. Win으로 승자를 고르세요.";
	if (action === "other") return null;

	const behavior = user.currentRoundBehavior;
	const picked = typeof behavior === "number" ? behavior : 0; // 고른 칩 금액
	const left = user.currentScore - user.currentRoundBet; // 남은 칩

	if (action === "chip") {
		if (behavior === "ALL-IN") return "이미 올인을 골랐어요. 바꾸려면 CANCEL을 누르세요.";
		if (picked + amount >= left) return `남은 칩이 ${left}이라 올인으로 바뀌었어요.`;
		return null;
	}

	if (behavior === "ALL-IN") return null;
	if (picked === 0) return "걸 칩을 먼저 고르세요.";
	const total = picked + user.currentRoundBet;
	if (total <= state.requiredCallScore)
		return `BET은 콜 금액 ${state.requiredCallScore}보다 많이 걸어야 해요. 지금은 ${total}이에요. 칩을 더 고르거나 CHECK / CALL을 누르세요.`;
	return null;
}
