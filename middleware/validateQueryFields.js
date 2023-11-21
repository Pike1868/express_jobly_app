const { BadRequestError } = require("../expressError");

//Middleware function to validate query parameters when querying companies with a filtered field, return new error if any field is not valid

function validateCompanyQueryFields(req, res, next) {
  const validCompanyFields = ["name", "minEmployees", "maxEmployees"];
  if (!Object.keys(req.query).every((key) => validCompanyFields.includes(key))) {
    return next(new BadRequestError("Invalid company fields"));
  }
  next();
}

function validateJobQueryFields(req, res, next) {
  const validJobFields = ["title", "minSalary", "hasEquity"];
  if (!Object.keys(req.query).every((key) => validJobFields.includes(key))) {
    return next(new BadRequestError("Invalid job fields"));
  }
  next();
}


module.exports = { validateCompanyQueryFields, validateJobQueryFields };
