const Joi = require('joi');

const ingredientSchema = Joi.object({
    restaurant_id: Joi.number().required(),
    menu_item_id: Joi.number().required(),
    inv_item_id: Joi.number().required(),
    unit_id: Joi.number().required(),
    quantity: Joi.number().min(0).required(),
    creator_id: Joi.number()
});

module.exports = {
    ingredientSchema
};
