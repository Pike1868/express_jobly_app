"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/jobs.js");
const { createToken } = require("../helpers/tokens");

let testJobsIds = [];

async function commonBeforeAll() {
  //set test db environment
  process.env.NODE_ENV = "test";
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create({
    handle: "c1",
    name: "C1",
    numEmployees: 1,
    description: "Desc1",
    logoUrl: "http://c1.img",
  });
  await Company.create({
    handle: "c2",
    name: "C2",
    numEmployees: 2,
    description: "Desc2",
    logoUrl: "http://c2.img",
  });
  await Company.create({
    handle: "c3",
    name: "C3",
    numEmployees: 3,
    description: "Desc3",
    logoUrl: "http://c3.img",
  });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.register({
    username: "adminTest1",
    firstName: "Test",
    lastName: "Admin",
    email: "adminTest1@email.com",
    password: "adminPassword",
    isAdmin: true,
  });

  //adding in test job data
  const j1 = await Job.create({
    title: "Accountant",
    salary: 100000,
    equity: "0.2",
    company_handle: "c1",
  });
  testJobsIds.push(j1.id);
  const j2 = await Job.create({
    title: "Counselor",
    salary: 50000,
    equity: "0",
    company_handle: "c3",
  });
  testJobsIds.push(j2.id);
  const j3 = await Job.create({
    title: "Customer Service Rep",
    salary: 55000,
    equity: "0",
    company_handle: "c1",
  });
  testJobsIds.push(j3.id);
  const j4 = await Job.create({
    title: "Cybersecurity Engineer",
    salary: 100000,
    equity: "0.5",
    company_handle: "c3",
  });
  testJobsIds.push(j4.id);
  const j5 = await Job.create({
    title: "Data analyst",
    salary: 80000,
    equity: "0.3",
    company_handle: "c3",
  });
  testJobsIds.push(j5.id);
  const j6 = await Job.create({
    title: "Software Engineer",
    salary: 80000,
    equity: "0.4",
    company_handle: "c1",
  });
  testJobsIds.push(j6.id);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const adminUserToken = createToken({ username: "adminTest1", isAdmin: true });
module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminUserToken,
  testJobsIds,
};
