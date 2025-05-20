const Joi = require("joi");

const tableSchema = Joi.object({
  restaurant_id: Joi.number().required(),
  number: Joi.number().required(),
});

module.exports = {
    tableSchema
}