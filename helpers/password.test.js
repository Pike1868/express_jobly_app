const { validatePassword } = require("./password");
describe("Password Validation", () => {
  test("validates a correct password", () => {
    const password = "ValidPass123";
    expect(validatePassword(password)).toBe(true);
  });

  test("rejects a password that is too short", () => {
    const password = "Short1";
    expect(validatePassword(password)).toContain(
      "Password must be at least 8 characters long"
    );
  });

  test("rejects a password that is too long", () => {
    const password = "A2z".repeat(20);
    expect(validatePassword(password)).toContain(
      "Password must be no more than 50 characters long"
    );
  });

  test("rejects a password without uppercase letters", () => {
    const password = "onlylower123";
    expect(validatePassword(password)).toContain(
      "Password must contain at least one uppercase letter"
    );
  });

  test("rejects a password without lowercase letters", () => {
    const password = "ONLYUPPER123";
    expect(validatePassword(password)).toContain(
      "Password must contain at least one lowercase letter"
    );
  });

  test("rejects a password without digits", () => {
    const password = "No_digits";
    expect(validatePassword(password)).toContain(
      "Password must contain at least one digit"
    );
  });

  test("rejects a password with spaces", () => {
    const password = "1Check for no spaces";
    expect(validatePassword(password)).toContain(
      "Password must not contain spaces"
    );
  });
});
