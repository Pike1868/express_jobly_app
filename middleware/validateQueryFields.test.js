const { BadRequestError } = require("../expressError");
const { validateCompanyQueryFields } = require("./validateQueryFields");

describe("validateQueryCompanyFields", function () {
  test("throws BadRequestError if any fields are invalid", function () {
    expect.assertions(1);
    const req = { query: { name: "net", symbol: "Test", city: "Atlanta" } };
    const res = {};
    const next = function (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    };
    validateCompanyQueryFields(req, res, next);
  });
});

describe("validateQueryCompanyFields", function () {
  test("works with valid fields", function () {
    expect.assertions(1);
    const req = {
      query: { name: "net" },
    };
    const res = {};
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    validateCompanyQueryFields(req, res, next);
  });
});

describe("validateQueryCompanyFields", function () {
  test("works with all valid fields", function () {
    expect.assertions(1);
    const req = {
      query: { name: "net", minEmployees: 100, maxEmployees: 200 },
    };
    const res = {};
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    validateCompanyQueryFields(req, res, next);
  });
});
