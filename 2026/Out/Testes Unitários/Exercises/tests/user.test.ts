import { User } from "../User";
import { mockUser } from "./mock/mockUser";
describe("User class", () => {
  let userService: User;

  beforeEach(() => {
    userService = new User(mockUser.name, mockUser.age, mockUser.email);
  });

  test("should create a new user with the provided properties", () => {
    expect(userService.getName()).toBe(mockUser.name);
    expect(userService.getAge()).toBe(mockUser.age);
    expect(userService.getEmail()).toBe(mockUser.email);
    expect(userService.isActive()).toBe(mockUser.active);
  });

  test("should update the user's name", () => {
    const newName = "Berg2";

    expect(userService.setName(newName));
    expect(userService.getName()).toBe(newName);
  });

  test("should update the user's email", () => {
    const newEmail = "Berg2@gmail.com";

    expect(userService.setEmail(newEmail));
    expect(userService.getEmail()).toBe(newEmail);
  });

  test("should return true when user is adult", () => {
    expect(userService.isAdult()).toBe(true);
  });

  test("should return false when user is under 18", () => {
    const minor = new User("Bob", 17, "bob@example.com");

    expect(minor.isAdult()).toBe(false);
  });

  test("should activate and deactivate the user", () => {
    userService.deactivate();
    expect(userService.isActive()).toBe(false);
    userService.activate();
    expect(userService.isActive()).toBe(true);
  });

  test("should return the correct description of the user", () => {
    const description = `${mockUser.name} is ${mockUser.age} years old and has the email ${mockUser.email}.`;
    expect(userService.getDescription()).toBe(description);
  });

  test("should compare when current user is older", () => {
    const user2 = new User("Alice", 18, "alice@example.com");

    expect(userService.compareAge(user2)).toBe("Berg is older than Alice.");
  });

  test("should compare the age of two users", () => {
    const user2 = new User("Alice", 25, "alice@example.com");

    expect(userService.compareAge(user2)).toBe(
      `${mockUser.name} is younger than ${user2.getName()}.`,
    );
  });

  test("should compare when users have the same age", () => {
    const user2 = new User("Alice", 21, "alice@example.com");

    expect(userService.compareAge(user2)).toBe(
      "Berg and Alice are the same age.",
    );
  });
});
