const Joi = require('joi');

const createClassroomSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  subject: Joi.string().trim().min(2).max(80).required(),
}).unknown(false);

const joinClassroomSchema = Joi.object({
  joinCode: Joi.string().trim().uppercase().alphanum().length(6).required(),
}).unknown(false);

const classroomIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[a-f\d]{24}$/i).required().messages({
    'string.pattern.base': '"id" must be a valid classroom ID',
  }),
}).unknown(false);

module.exports = {
  createClassroomSchema,
  joinClassroomSchema,
  classroomIdParamSchema,
};
