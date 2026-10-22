const NewsRepository = require('./news.repository');
const NewsService = require('./news.service');
const NewsController = require('./news.controller');
const pool = require('../../database/connection');

const {
  createNewsSchema,
  updateNewsSchema,
} = require('./news.validation');

const newsRepository = new NewsRepository(pool);
const newsService = new NewsService(newsRepository);
const newsController = new NewsController(newsService);

const validatePayload = (schema, payload) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const validationError = new Error('Request validation failed.');
    validationError.statusCode = 400;
    validationError.details = error.details.map(
      (detail) => detail.message
    );
    throw validationError;
  }

  return value;
};

const newsRoutes = [
  {
    method: 'GET',
    path: '/api/v1/news',
    handler: (request, h) => newsController.getAll(request, h),
  },
  {
    method: 'GET',
    path: '/api/v1/news/deleted',
    handler: (request, h) => newsController.getDeleted(request, h),
  },
  {
    method: 'GET',
    path: '/api/v1/news/{id}',
    handler: (request, h) => newsController.getById(request, h),
  },
  {
    method: 'POST',
    path: '/api/v1/news',
    handler: (request, h) => {
      const validatedPayload = validatePayload(
        createNewsSchema,
        request.payload
      );

      return newsController.create(
        { ...request, payload: validatedPayload },
        h
      );
    },
  },
  {
    method: 'PUT',
    path: '/api/v1/news/{id}',
    handler: (request, h) => {
      const validatedPayload = validatePayload(
        updateNewsSchema,
        request.payload
      );

      return newsController.update(
        { ...request, payload: validatedPayload },
        h
      );
    },
  },
  {
    method: 'DELETE',
    path: '/api/v1/news/{id}',
    handler: (request, h) => newsController.delete(request, h),
  },
  {
    method: 'PATCH',
    path: '/api/v1/news/{id}/restore',
    handler: (request, h) => newsController.restore(request, h),
  },
];

module.exports = newsRoutes;