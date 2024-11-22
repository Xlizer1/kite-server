const Joi = require("joi");

const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email(),
  username: Joi.string().min(3).max(30).required(),
  phone: Joi.string()
    .pattern(/^00964(77|78|79|75)[0-9]{8}$/)
    .required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.number().integer().positive().required(),
  restaurant_id: Joi.number().integer().positive().required(),
});

const loginUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
};
