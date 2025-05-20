const Joi = require("joi");

const subCategorySchema = Joi.object({
    name: Joi.string().required(),
    restaurant_id: Joi.number().required(),
    image: Joi.binary().required(),
});

module.exports = {
    subCategorySchema
}