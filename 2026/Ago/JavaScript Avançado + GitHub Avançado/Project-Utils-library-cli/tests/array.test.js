import * as array from "../src/array.js";
test("unique", () => {
    expect(array.unique([1,1,2,3])).toEqual([1,2,3]);
});

test("last", () => {
    expect(array.last([5,8,9])).toBe(9);
});