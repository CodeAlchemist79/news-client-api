
'use strict';

const Joi = require('joi');

const createTagSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(80)
    .required(),

  slug: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
}).unknown(false);

const updateTagSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(80)
    .required(),

  slug: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
}).unknown(false);

module.exports = {
  createTagSchema,
  updateTagSchema,
};
