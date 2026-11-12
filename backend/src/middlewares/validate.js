const ApiError = require('../utils/ApiError');

const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    convert: true,
    allowUnknown: false,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join('; ');
    return next(new ApiError(400, message));
  }

  req[property] = value;
  return next();
};

module.exports = validate;
