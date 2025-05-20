const Joi = require("joi");

const itemSchema = Joi.object({
    restaurant_id: Joi.number().required(),
    sub_category_id: Joi.number().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    is_shisha: Joi.number().valid(0, 1).required(),
    currency_id: Joi.number().required(),
    image: Joi.object({
        fieldname: Joi.string(),
        originalname: Joi.string(),
        encoding: Joi.string(),
        mimetype: Joi.string(),
        destination: Joi.string(),
        filename: Joi.string(),
        path: Joi.string(),
        size: Joi.number()
    }).optional()
});

module.exports = {
    itemSchema
}