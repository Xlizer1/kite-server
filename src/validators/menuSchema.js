const Joi = require("joi");

const menuLoginSchema = Joi.object({
    key: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
});

module.exports = {
    menuLoginSchema,
};
