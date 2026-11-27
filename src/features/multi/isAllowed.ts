import { BET_AMOUNTS } from "../single/chips";
import {
	AllIn,
	CheckOrCall,
	type State,
	betScore,
	dieUser,
	incrementUserCurrentRoundBehavior,
	resetUserCurrentRoundBehavior,
} from "../single/singleSlice";

const BET_ACTIONS: string[] = [
	incrementUserCurrentRoundBehavior.type,
	resetUserCurrentRoundBehavior.type,
	betScore.type,
	CheckOrCall.type,
	AllIn.type,
	dieUser.type,
];

// 방장이 참가자가 보낸 액션을 실행해도 되는지 검사한다
export function isAllowed(
	state: State,
	seat: number,
	action: { type?: unknown; payload?: unknown }
) {
	if (seat < 0 || state.userTurnOrder[0] !== seat) return false;
	if (typeof action?.type !== "string" || !BET_ACTIONS.includes(action.type))
		return false;
	if (action.type === incrementUserCurrentRoundBehavior.type)
		return BET_AMOUNTS.includes(action.payload as number);
	return true;
}
