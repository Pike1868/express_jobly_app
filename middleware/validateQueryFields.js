const { BadRequestError } = require("../expressError");

//Middleware function to validate query parameters when querying companies with a filtered field, return new error

function validateCompanyQueryFields(req, res, next) {
  const validCompanyFields = ["name", "minEmployees", "maxEmployees"];
  if (!Object.keys(req.query).every((key) => validCompanyFields.includes(key))) {
    return next(new BadRequestError("Invalid company fields"));
  }
  next();
}

module.exports = { validateCompanyQueryFields };
