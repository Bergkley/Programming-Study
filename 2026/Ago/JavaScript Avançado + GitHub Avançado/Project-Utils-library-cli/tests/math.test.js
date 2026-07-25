import * as math from "../src/math.js";
test("sum", () => {
    expect(math.sum(2,3)).toBe(5);
});

test("subtract", () => {
    expect(math.subtract(5,2)).toBe(3);
});

test("multiply", () => {
    expect(math.multiply(5,4)).toBe(20);
});

test("divide", () => {
    expect(math.divide(10,2)).toBe(5);
});