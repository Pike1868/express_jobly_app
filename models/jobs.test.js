"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 10000,
    equity: 0,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      title: "new",
      salary: 10000,
      equity: "0",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 10000,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll*/
describe("findAll", function () {
  test("works:no filter, NOTE: All jobs ordered by title!", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        title: "Counselor",
        salary: 50000,
        equity: "0",
        companyHandle: "c2",
      },
      {
        title: "Customer Service Rep",
        salary: 55000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        title: "Data analyst",
        salary: 80000,
        equity: "0.3",
        companyHandle: "c3",
      },
      {
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        title: "Sales Executive",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        title: "Software engineer",
        salary: 90000,
        equity: "0.25",
        companyHandle: "c3",
      },
      {
        title: "Teacher",
        salary: 40000,
        equity: "0",
        companyHandle: "c2",
      },
      {
        title: "UX Designer",
        salary: 90000,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });
  test("works:with title filter (single letter)", async function () {
    let jobs = await Job.findAll({ title: "c" });
    expect(jobs).toEqual([
      {
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        title: "Counselor",
        salary: 50000,
        equity: "0",
        companyHandle: "c2",
      },
      {
        title: "Customer Service Rep",
        salary: 55000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        title: "Sales Executive",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        title: "Teacher",
        salary: 40000,
        equity: "0",
        companyHandle: "c2",
      },
    ]);
  });

  test("works:with salary filter", async function () {
    let jobs = await Job.findAll({ minSalary: 65000 });
    expect(jobs).toEqual([
      {
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        title: "Data analyst",
        salary: 80000,
        equity: "0.3",
        companyHandle: "c3",
      },
      {
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        title: "Software engineer",
        salary: 90000,
        equity: "0.25",
        companyHandle: "c3",
      },
      {
        title: "UX Designer",
        salary: 90000,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });
  test("works with equity filter", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        title: "Data analyst",
        salary: 80000,
        equity: "0.3",
        companyHandle: "c3",
      },
      {
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        title: "Sales Executive",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        title: "Software engineer",
        salary: 90000,
        equity: "0.25",
        companyHandle: "c3",
      },
      {
        title: "UX Designer",
        salary: 90000,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });
});
