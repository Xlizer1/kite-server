const Joi = require('joi');

const inventorySchema = Joi.object({
    restaurant_id: Joi.number().required(),
    name: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    unit_id: Joi.number().required(),
    threshold: Joi.number().min(0),
    price: Joi.number().min(0).required(),
    currency_id: Joi.number().required()
});

module.exports = {
    inventorySchema
};
