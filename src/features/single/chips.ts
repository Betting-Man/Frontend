// 칩 금액과 색 - 큰 금액부터
export const CHIP_COLORS: Record<number, string> = {
	5000: "#18181b",
	1000: "#16a34a",
	500: "#2563eb",
	100: "#dc2626",
	50: "#f5f5f4",
};

export const CHIP_VALUES = Object.keys(CHIP_COLORS)
	.map(Number)
	.sort((a, b) => b - a);

// BetBoard 칩 버튼 금액
export const BET_AMOUNTS = [100, 500, 1000];

// 화면에 그리는 칩 개수 상한
export const MAX_CHIPS = 200;

// 금액을 칩 금액 배열로 바꾼다 - 큰 금액부터 나눈다. 50 미만 나머지는 버린다
export function toChips(amount: number): number[] {
	const chips: number[] = [];
	let rest = amount;
	for (const value of CHIP_VALUES) {
		while (rest >= value && chips.length < MAX_CHIPS) {
			chips.push(value);
			rest -= value;
		}
	}
	return chips;
}
