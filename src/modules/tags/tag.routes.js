
'use strict';

const TagRepository = require('./tag.repository');
const TagService = require('./tag.service');
const TagController = require('./tag.controller');
const pool = require('../../database/connection');

const {
  createTagSchema,
  updateTagSchema,
} = require('./tag.validation');

const tagRepository = new TagRepository(pool);
const tagService = new TagService(tagRepository);
const tagController = new TagController(tagService);

const validatePayload = (schema, payload) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const validationError = new Error(
      'Request validation failed.'
    );

    validationError.statusCode = 400;
    validationError.details = error.details.map(
      (detail) => detail.message
    );

    throw validationError;
  }

  return value;
};

const tagRoutes = [
  {
    method: 'GET',
    path: '/api/v1/tags',
    handler: (request, h) => tagController.getAll(request, h),
  },
  {
    method: 'GET',
    path: '/api/v1/tags/{id}',
    handler: (request, h) => tagController.getById(request, h),
  },
  {
    method: 'POST',
    path: '/api/v1/tags',
    handler: (request, h) => {
      const payload = validatePayload(
        createTagSchema,
        request.payload
      );

      return tagController.create(
        { ...request, payload },
        h
      );
    },
  },
  {
    method: 'PUT',
    path: '/api/v1/tags/{id}',
    handler: (request, h) => {
      const payload = validatePayload(
        updateTagSchema,
        request.payload
      );

      return tagController.update(
        { ...request, payload },
        h
      );
    },
  },
  {
    method: 'DELETE',
    path: '/api/v1/tags/{id}',
    handler: (request, h) => tagController.delete(request, h),
  },
];

module.exports = tagRoutes;
