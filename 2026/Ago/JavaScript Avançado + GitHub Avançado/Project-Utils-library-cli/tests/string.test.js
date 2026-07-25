import * as string from "../src/string.js";
test("capitalize", () => {
    expect(string.capitalize("berg")).toBe("Berg");
});

test("reverse", () => {
    expect(string.reverse("abc")).toBe("cba");
});