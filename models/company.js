"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies (filtered optional)
   *
   * Builds a parameterized sql query to retrieve company information, adding a WHERE statement to the baseQuery if filters are passed in.
   *
   *
   * For Each Filter Param:
   *  -Builds & adds a where condition to whereFilters array
   *  -Adds values to filter by to the filterValues array
   *
   * Executes the database query by passing in the final constructed sql query and the array of filterValues.
   *
   * Returns:
   * [{ handle, name, description, numEmployees, logoUrl }, ...]
   * OR
   * an empty array [] if no companies match whereFilters
   *
   * */

  static async findAll(filters) {
    let baseQuery = `
      SELECT handle, 
            name, 
            description, 
            num_employees AS "numEmployees", 
            logo_url AS "logoUrl"
      FROM companies`;
    let whereFilters = [];
    let filterValues = [];

    if (filters.name) {
      whereFilters.push(`name ILIKE $${whereFilters.length + 1}`);
      filterValues.push(`%${filters.name}%`);
    }

    if (filters.minEmployees) {
      whereFilters.push(`num_employees >= $${whereFilters.length + 1}`);
      filterValues.push(filters.minEmployees);
    }

    if (filters.maxEmployees) {
      whereFilters.push(`num_employees <= $${whereFilters.length + 1}`);
      filterValues.push(filters.maxEmployees);
    }

    if (whereFilters.length > 0) {
      baseQuery += " WHERE " + whereFilters.join(" AND ");
    }

    const fullQuery = (baseQuery += " ORDER BY name");

    const companiesRes = await db.query(fullQuery, filterValues);

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
