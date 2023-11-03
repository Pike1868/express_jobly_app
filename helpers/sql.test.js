const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

const jsToSql = {
  firstName: "first_name",
  lastName: "last_name",
  isAdmin: "is_admin",
};

describe("Test sqlForPartialUpdate", function () {
  test("Updates fields that need snake case conversion", function () {
    const data = { firstName: "user1first", lastName: "user1last" };

    const result = sqlForPartialUpdate(data, jsToSql);

    expect(result).toEqual({
      setCols: `"first_name"=$1, "last_name"=$2`,
      values: ["user1first", "user1last"],
    });
  });

  test("Updates fields not converted to snake case", async function () {
    const data = { password: "dummyPassword", email: "user1@email.com" };

    const result = sqlForPartialUpdate(data, jsToSql);

    expect(result).toEqual({
      setCols: `"password"=$1, "email"=$2`,
      values: ["dummyPassword", "user1@email.com"],
    });
  });

  test(`Empty data object throws "No data" error`, async function () {
    try {
      const dataToUpdate = {};

      sqlForPartialUpdate(dataToUpdate, jsToSql);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("Updates mix of converted/non-converted case fields", async function () {
    const data = { firstName: "user1first", email: "user1@email.com" };

    const result = sqlForPartialUpdate(data, jsToSql);

    expect(result).toEqual({
      setCols: `"first_name"=$1, "email"=$2`,
      values: ["user1first", "user1@email.com"],
    });
  });
});
