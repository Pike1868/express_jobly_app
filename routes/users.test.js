"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminUserToken,
  testJobsIds,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
  test("works for admin users: creates non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });

  test("works for admin users: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      },
      token: expect.any(String),
    });
  });

  test("unauthorized error for anonymous user", async function () {
    const resp = await request(app).post("/users").send({
      username: "u-new",
      firstName: "First-new",
      lastName: "Last-newL",
      email: "new@email.com",
      isAdmin: true,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized error for non-admin users", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request error if missing data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request error if invalid data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "not-an-email",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "adminTest1",
          firstName: "Test",
          lastName: "Admin",
          email: "adminTest1@email.com",
          isAdmin: true,
        },
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          isAdmin: false,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          isAdmin: false,
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          isAdmin: false,
        },
      ],
    });
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for current users", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        jobs: [],
      },
    });
  });

  test("works for admin users", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        jobs: [],
      },
    });
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for non-admin user to get another user's info", async function () {
    const resp = await request(app)
      .get(`/users/u2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get(`/users/nope`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works for admin users", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });
  test("works for current users", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });

  test("unauthorized for anonymous user", async function () {
    const resp = await request(app).patch(`/users/u1`).send({
      firstName: "New",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for non admin users to update another user's info", async function () {
    const resp = await request(app).patch(`/users/u1`).send({
      firstName: "New",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found error if username does not exist", async function () {
    const resp = await request(app)
      .patch(`/users/nope`)
      .send({
        firstName: "Nope",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request error if invalid data", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: set new password by admin user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });

  test("works: set new password by current user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .delete(`/users/u2`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({ deleted: "u2" });
  });

  test("works for current users", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for non-admin user to delete another user", async function () {
    const resp = await request(app)
      .delete(`/users/u2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if username does not exist", async function () {
    const resp = await request(app)
      .delete(`/users/nope`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** POST /users/:username/jobs/:id */

describe("POST /users/:username/jobs/:id", function () {
  test("works for admin user to apply to a job for a user", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/${testJobsIds[1]}`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.body).toEqual({ applied: testJobsIds[1] });
  });

  test("current user able to apply for job", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/${testJobsIds[1]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ applied: testJobsIds[1] });
  });

  test("unauthorized for non admin users to apply to jobs for other users", async function () {
    const resp = await request(app)
      .post(`/users/u3/jobs/${testJobsIds[1]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).post(`/users/u1/jobs/${testJobsIds[1]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found error if username does not exist", async function () {
    const resp = await request(app)
      .post(`/users/nope/jobs/${testJobsIds[1]}`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found error if job id is invalid", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/0`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request error if job id is invalid", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/0`)
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username/password */

describe("PATCH /users/:username/password", function () {
  test("works for admin user", async function () {
    const resp = await request(app)
      .patch(`/users/u1/password`)
      .send({ password: "newPassword1" })
      .set("authorization", `Bearer ${adminUserToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      message: "Password updated successfully for u1",
    });
  });
  test("works for correct user", async function () {
    const resp = await request(app)
      .patch(`/users/u1/password`)
      .send({ password: "newPassword1" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      message: "Password updated successfully for u1",
    });
  });

  test("unauthorized for wrong user", async function () {
    const resp = await request(app)
      .patch("/users/u1/password")
      .send({ password: "newPassword1" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app)
      .patch("/users/u1/password")
      .send({ password: "newPassword1" });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request error with invalid password", async function () {
    const resp = await request(app)
      .patch("/users/u1/password")
      .send({ password: "Short1" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual(
      "Invalid password: Password must be at least 8 characters long"
    );
  });
});
