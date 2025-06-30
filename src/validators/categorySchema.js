const Joi = require("joi");

const categoryCreateSchema = Joi.object({
    name: Joi.string().required(),
    restaurant_id: Joi.number().required(),
    image: Joi.any(),
});

const categoryUpdateSchema = Joi.object({
    name: Joi.string().required(),
    restaurant_id: Joi.number().required(),
    image: Joi.any(),
});

const categoryImageUpdateSchema = Joi.object({
    category_id: Joi.number().required(),
    image: Joi.any(),
});

module.exports = {
    categoryCreateSchema,
    categoryUpdateSchema,
    categoryImageUpdateSchema,
};
