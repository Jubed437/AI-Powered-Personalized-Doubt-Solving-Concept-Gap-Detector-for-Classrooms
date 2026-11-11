const Joi = require('joi');

const createDoubtSchema = Joi.object({
  classroomId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      'string.pattern.base': '"classroomId" must be a valid classroom ID',
    }),
  subject: Joi.string().trim().min(1).max(80).required(),
  topic: Joi.string().trim().min(1).max(120).required(),
  text: Joi.string().trim().min(1).max(2000).required().messages({
    'string.max': '"text" must be at most 2000 characters long',
  }),
}).unknown(false);

const listDoubtsSchema = Joi.object({
  classroomId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .messages({
      'string.pattern.base': '"classroomId" must be a valid classroom ID',
    }),
  status: Joi.string().valid('pending', 'answered', 'failed'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);

const doubtIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[a-f\d]{24}$/i).required().messages({
    'string.pattern.base': '"id" must be a valid doubt ID',
  }),
}).unknown(false);

module.exports = {
  createDoubtSchema,
  listDoubtsSchema,
  doubtIdParamSchema,
};
