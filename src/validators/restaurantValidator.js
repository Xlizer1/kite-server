const Joi = require("joi");

const restaurantSchema = Joi.object({
    parent_rest_id: Joi.number().required(),
    name: Joi.string().required(),
    tagline: Joi.string().required(),
    tagline_eng: Joi.string().required(),
    description: Joi.string().required(),
    description_eng: Joi.string().required(),
    image: Joi.binary().required(),
});

module.exports = {
    restaurantSchema,
};
