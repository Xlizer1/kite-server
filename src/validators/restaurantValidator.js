const Joi = require("joi");

const restaurantSchema = Joi.object({
    parent_rest_id: Joi.number().required(),
    name: Joi.string().required(),
    tagline: Joi.string().required(),
    description: Joi.string().required(),
});

module.exports = {
    restaurantSchema
}