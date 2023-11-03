const { BadRequestError } = require("../expressError");

/** Generates sql SET clause for partial update and an array values.
 *
 * Params:
 *  dataToUpdate = Object containing fields to update
 *  jsToSql = Object with fields as keys in camelCase and values as their snake_case conversion
 *
 * Returns an Object: { setCols: "col_name1, col_name2", values: [value1, value2] }
 *
 * Throws BadRequestError if not found.
 *
 * Note: Used in models/user.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
