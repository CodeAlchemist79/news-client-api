
const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  slug: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),

  description: Joi.string()
    .trim()
    .allow('', null)
    .optional(),
}).unknown(false);

const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  slug: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),

  description: Joi.string()
    .trim()
    .allow('', null)
    .optional(),
}).unknown(false);

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
