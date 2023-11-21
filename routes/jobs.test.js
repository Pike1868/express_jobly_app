"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminUserToken,
  testJobsIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("ok for users with admin permissions", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        company_handle: "c1",
        title: "Intern",
        salary: 10,
        equity: 0.2,
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Intern",
        salary: 10,
        equity: "0.2",
        companyHandle: "c1",
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: "c1",
        title: "Intern",
        salary: 10,
        equity: "0.2",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request error with missing required data", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request error if salary is not a number", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: "c1",
        title: "Janitor",
        salary: "five",
        equity: "0.2",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });
  test("bad request error if equity is a negative number", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: "c1",
        title: "Janitor",
        salary: "five",
        equity: -1,
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for non-admins and anonymous users", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
      jobs: [
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
          companyHandle: "c3",
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
          title: "Software Engineer",
          salary: 80000,
          equity: "0.4",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("works: filtering hasEquity", async function () {
    const resp = await request(app).get(`/jobs`).query({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs: [
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
          title: "Software Engineer",
          salary: 80000,
          equity: "0.4",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("works: filtering on 2 filters", async function () {
    const resp = await request(app)
      .get(`/jobs`)
      .query({ minSalary: 75000, title: "engineer" });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Cybersecurity Engineer",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c3",
        },
        {
          id: expect.any(Number),
          title: "Software Engineer",
          salary: 80000,
          equity: "0.4",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("bad request error when using an invalid filter property", async function () {
    const resp = await request(app)
      .get(`/jobs`)
      .query({ minSalary: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anonymous users", async function () {
    const resp = await request(app).get(`/jobs/${testJobsIds[0]}`);
    expect(resp.body).toEqual({
      id: testJobsIds[0],
      title: "Accountant",
      salary: 100000,
      equity: "0.2",
      companyHandle: "c1",
    });
  });

  test("not found error if job id is invalid", async function () {
    const resp = await request(app).get(`/jobs/9000`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("ok for users with admin permissions", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobsIds[0]}`)
      .send({
        title: "Analyst",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({
      id: testJobsIds[0],
      title: "Analyst",
      salary: 100000,
      equity: "0.2",
      companyHandle: "c1",
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobsIds[0]}`)
      .send({
        title: "New Job Title",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found error if job id is invalid", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        handle: "new",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request error if company handle has no match", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobsIds[0]}`)
      .send({
        handle: "new",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request error with invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobsIds[0]}`)
      .send({
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("ok for users with admin permissions", async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJobsIds[0]}`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({ deleted: testJobsIds[0] });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJobsIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).delete(`/jobs/${testJobsIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found error if job id is invalid", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
