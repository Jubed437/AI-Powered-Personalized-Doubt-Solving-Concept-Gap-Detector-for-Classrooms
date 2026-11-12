const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
  role: Joi.string().valid('student', 'teacher').default('student'),
}).unknown(false);

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
}).unknown(false);

module.exports = { registerSchema, loginSchema };
