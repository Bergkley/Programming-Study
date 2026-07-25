import * as string from "../src/string.js";
test("capitalize", () => {
    expect(string.capitalize("chatgpt")).toBe("Chatgpt");
});

test("reverse", () => {
    expect(string.reverse("abc")).toBe("cba");
});