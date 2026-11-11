const Joi = require('joi');

const createDoubtSchema = Joi.object({
  classroomId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      'string.pattern.base': '"classroomId" must be a valid classroom ID',
    }),
  topic: Joi.string().trim().min(1).max(120).required(),
  text: Joi.string().trim().min(1).max(2000).required().messages({
    'string.max': '"text" must be at most 2000 characters long',
  }),
}).unknown(false);

const listDoubtsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(false);

module.exports = { createDoubtSchema, listDoubtsSchema };
