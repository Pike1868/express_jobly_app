const PasswordValidator = require("password-validator");

const schema = new PasswordValidator();

schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(50) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letter
  .has()
  .lowercase() // Must have lowercase letter
  .has()
  .digits(1) // Must have at least 1 digit
  .has()
  .not()
  .spaces(); // Should not have spaces

/**
 * Custom password rule messages
 */
const passwordRulesMessages = {
  min: "Password must be at least 8 characters long",
  max: "Password must be no more than 50 characters long",
  uppercase: "Password must contain at least one uppercase letter",
  lowercase: "Password must contain at least one lowercase letter",
  digits: "Password must contain at least one digit",
  spaces: "Password must not contain spaces",
};

/**
 * Validate a password against the schema
 * Takes password to validate
 * returns true if valid or returns failed messages for each validation that failed
 */
function validatePassword(password) {
  const failedRules = schema.validate(password, { list: true });
  if (failedRules.length === 0) {
    return true;
  } else {
    // Map the failed rule names to custom messages
    const failedMessages = failedRules.map(
      (rule) => passwordRulesMessages[rule]
    );
    return failedMessages;
  }
}

module.exports = { validatePassword };
