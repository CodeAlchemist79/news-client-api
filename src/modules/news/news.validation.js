const Joi = require('joi');

const articleFields = {
  category_id: Joi.number().integer().positive().allow(null),

  title: Joi.string().trim().min(1).max(200),

  slug: Joi.string()
    .trim()
    .min(1)
    .max(220)
    .pattern(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/),

  summary: Joi.string().max(500).allow('', null),

  content: Joi.string().allow('', null),

  status: Joi.string().valid('draft', 'published', 'archived'),

  tag_names: Joi.array()
    .items(Joi.string().trim().min(1).max(100))
    .max(50),
};

// Creating an article requires both title and content.
const createNewsSchema = Joi.object({
  ...articleFields,
  title: articleFields.title.required(),
  content: Joi.string().required(),
}).unknown(false);

// Updating an article requires a title.
// Other fields can be omitted and retain their existing values.
const updateNewsSchema = Joi.object({
  ...articleFields,
  title: articleFields.title.required(),
}).unknown(false);

module.exports = {
  createNewsSchema,
  updateNewsSchema,
};