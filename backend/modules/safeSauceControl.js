const Joi = require('joi');

const safeSauceSchema = Joi.object({

    name: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 .-]+$'))
        .min(1)
        .max(70)
        .required(),

    manufacturer: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 .-]+$'))
        .min(1)
        .max(70)
        .required(),

    description: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ,.-]+$'))
        .min(10)
        .max(1000)
        .required(),

    mainPepper: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ,.-]+$'))
        .min(2)
        .max(300)
        .required(),

    heat: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .required(),

    userId: Joi.string()
    .required(),

});

module.exports = safeSauceSchema;

