import { MAX_CHIPS, toChips } from "./chips";

test("큰 금액 칩부터 나눈다", () => {
	expect(toChips(6650)).toEqual([5000, 1000, 500, 100, 50]);
});

test("0이면 칩이 없다", () => {
	expect(toChips(0)).toEqual([]);
});

test("칩 개수는 상한을 넘지 않는다", () => {
	expect(toChips(5000 * 1000)).toHaveLength(MAX_CHIPS);
});

test("칩 종류를 줄이면 그 칩으로만 나눈다", () => {
	expect(toChips(5600, [1000, 100])).toEqual([1000, 1000, 1000, 1000, 1000, 100, 100, 100, 100, 100, 100]);
});
