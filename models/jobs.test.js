"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobsIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create - JOB", function () {
  const newJob = {
    title: "new",
    salary: 10000,
    equity: 0,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
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
describe("findAll - JOB", function () {
  test("works:no filter, NOTE: All jobs ordered by title!", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Counselor",
        salary: 50000,
        equity: "0",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "Customer Service Rep",
        salary: 55000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Data analyst",
        salary: 80000,
        equity: "0.3",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "Sales Executive",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Software engineer",
        salary: 90000,
        equity: "0.25",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Teacher",
        salary: 40000,
        equity: "0",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Counselor",
        salary: 50000,
        equity: "0",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "Customer Service Rep",
        salary: 55000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "Sales Executive",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Data analyst",
        salary: 80000,
        equity: "0.3",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "Software engineer",
        salary: 90000,
        equity: "0.25",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "Accountant",
        salary: 100000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Cybersecurity Engineer",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Data analyst",
        salary: 80000,
        equity: "0.3",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Principal",
        salary: 90000,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "Sales Executive",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Software engineer",
        salary: 90000,
        equity: "0.25",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "UX Designer",
        salary: 90000,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get - JOB", function () {
  test("works", async function () {
    let job = await Job.get(testJobsIds[0]);
    expect(job).toEqual({
      id: testJobsIds[0],
      title: "Sales Executive",
      salary: 50000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("bad request if id given is not a number", async function () {
    try {
      await Job.get("nope");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found id is not a valid job id", async function () {
    try {
      await Job.get(9000);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update - JOB", function () {
  let updateData = {
    title: "Sales Manager",
    salary: 70000,
    equity: "0.2",
  };
  test("works", async function () {
    let job = await Job.update(testJobsIds[0], updateData);
    expect(job).toEqual({
      id: testJobsIds[0],
      title: "Sales Manager",
      salary: 70000,
      equity: "0.2",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(9000, {
        title: "test updates",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobsIds[0], {});
      fail();
    } catch (err) {
      console.log(err);
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove - JOB", function () {
  test("works", async function () {
    await Job.remove(testJobsIds[0]);
    const res = await db.query("SELECT id FROM jobs WHERE id=$1", [
      testJobsIds[0],
    ]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      console.log(err);
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
