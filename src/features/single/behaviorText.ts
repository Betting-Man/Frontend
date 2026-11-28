import type { User } from "./singleSlice";

// 상태에 저장하는 행동 값(CHECK·CALL·ALL-IN·DIE)을 화면에 보여 줄 한국어로 바꾼다. 숫자는 그대로 둔다.
const TEXT: Record<string, string> = { CHECK: "체크", CALL: "콜", "ALL-IN": "올인", DIE: "다이" };

export const behaviorText = (behavior: User["currentRoundBehavior"]) =>
	typeof behavior === "number" ? String(behavior) : (TEXT[behavior] ?? behavior);
