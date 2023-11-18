"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /**
   * Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database
   */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT title, company_handle
            FROM jobs
            WHERE title = $1 AND company_handle = $2`,
      [title, company_handle]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate job: ${title}`);
    }

    const result = await db.query(
      `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES($1, $2, $3, $4)
        RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs (filtered optional)
   *
   * Builds a parameterized sql query to retrieve jobs information, adding a WHERE statement to the baseQuery if filters are passed in.
   *
   *
   * For Each Filter Param:
   *  -Builds & adds a where condition to whereFilters array
   *  -Adds values to filter by to the filterValues array
   *
   * Executes the database query by passing in the final constructed sql query and the array of filterValues.
   *
   * Returns:
   * [{ title, salary, equity, companyHandle }, ...]
   * OR
   * an empty array [] if no jobs match whereFilters
   *
   * */
  static async findAll(filters) {
    let baseQuery = `
    SELECT title,
    salary,
    equity,
    company_handle AS "companyHandle"
    FROM jobs`;
    let whereFilters = [];
    let filterValues = [];

    if (filters.title) {
      whereFilters.push(`title ILIKE $${whereFilters.length + 1}`);
      filterValues.push(`%${filters.title}%`);
    }

    if (filters.minSalary) {
      whereFilters.push(`salary >= $${whereFilters.length + 1}`);
      filterValues.push(filters.minSalary);
    }

    if (filters.hasEquity) {
      whereFilters.push(`equity > 0`);
    }

    if (whereFilters.length > 0) {
      baseQuery += " WHERE " + whereFilters.join(" AND ");
    }

    const fullQuery = (baseQuery += " ORDER BY title");
    console.log(fullQuery)

    const jobs = await db.query(fullQuery, filterValues);

    return jobs.rows;
  }

  /**Given id return data about a job
   *
   * Returns {title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if no job with given id exists.
   */

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
      title,
      salary,
      equity,
      company_handle AS companyHandle
      FROM jobs
      WHERE id =$1
      `,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) {
      throw new NotFoundError(`No job with id of: ${id}`);
    }
    return job;
  }

  /**Update job data with 'data'
   *
   * Can be a partial update, will only change the provided fields.
   *
   * Data can include: {title, salary, equity, companyHandle}
   *
   * Returns {title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if no job with given id exists.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });

    const handleVarIdx = "$" + (values.length + 1);
    const querySql = `
    UPDATE jobs
    SET ${setCols}
    WHERE id = ${handleVarIdx}
    RETURNING title,
    salary,
    equity,
    company_handle AS companyHandle`;

    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) {
      throw new NotFoundError(`No job with id of: ${id}`);
    }
    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
      [id]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Job;
