const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");
let testJobsIds = [];

async function commonBeforeAll() {
  //set test db environment
  process.env.NODE_ENV = "test";
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SQLWithoutWhere
  await db.query("DELETE FROM jobs");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(
    `
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

  const testJobsResult =
    await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('Sales Executive', 50000, 0.1, 'c1'),
       ('Accountant', 100000, 0.2, 'c1'),
       ('Customer Service Rep', 55000, 0, 'c1'),
       ('Teacher', 40000, 0, 'c2'),
       ('Counselor', 50000, 0, 'c2'),
       ('Principal', 90000, 0.2, 'c2'),
       ('Data analyst', 80000, 0.3, 'c3'),
       ('Software engineer', 90000, 0.25, 'c3'),
       ('UX Designer', 90000, 0.1, 'c3'),
       ('Cybersecurity Engineer', 100000, 0.5, 'c3')
       RETURNING id, title, salary, equity, company_handle`);

  testJobsIds.splice(0, 0, ...testJobsResult.rows.map((job) => job.id));
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobsIds,
};
