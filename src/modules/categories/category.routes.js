const CategoryRepository = require('./category.repository');
const CategoryService = require('./category.service');
const CategoryController = require('./category.controller');
const pool = require('../../database/connection');

const {
  createCategorySchema,
  updateCategorySchema,
} = require('./category.validation');

const categoryRepository = new CategoryRepository(pool);
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

const categoryRoutes = [
  {
    method: 'GET',
    path: '/api/v1/categories',
    handler: (request, h) => categoryController.getAll(request, h),
  },
  {
    method: 'GET',
    path: '/api/v1/categories/{id}',
    handler: (request, h) => categoryController.getById(request, h),
  },
  {
    method: 'POST',
    path: '/api/v1/categories',
    options: {
      validate: {
        payload: createCategorySchema,
        failAction: async (request, h, error) => {
          return h.response({
            status: 'error',
            message: 'Request validation failed.',
            details: error.details.map((detail) => detail.message),
          }).code(400).takeover();
        },
      },
    },
    handler: (request, h) => categoryController.create(request, h),
  },
  {
    method: 'PUT',
    path: '/api/v1/categories/{id}',
    options: {
      validate: {
        payload: updateCategorySchema,
        failAction: async (request, h, error) => {
          return h.response({
            status: 'error',
            message: 'Request validation failed.',
            details: error.details.map((detail) => detail.message),
          }).code(400).takeover();
        },
      },
    },
    handler: (request, h) => categoryController.update(request, h),
  },
  {
    method: 'DELETE',
    path: '/api/v1/categories/{id}',
    handler: (request, h) => categoryController.delete(request, h),
  },
];

module.exports = categoryRoutes;