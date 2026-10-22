require('dotenv').config();

const Hapi = require('@hapi/hapi');
const pool = require('./database/connection');

const categoryRoutes = require('./modules/categories/category.routes');
const newsRoutes = require('./modules/news/news.routes');

const init = async () => {
  const server = Hapi.server({
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Centralized error handling.
  server.ext('onPreResponse', (request, h) => {
    const error = request.response;

    if (!(error instanceof Error)) {
      return h.continue;
    }

    let statusCode = error.statusCode || error.output?.statusCode || 500;
    let message = error.message || 'An unexpected error occurred.';

    // Log unexpected server errors for debugging.
    if (statusCode >= 500) {
      console.error('\n========== API SERVER ERROR ==========');
      console.error(
        'Request:',
        request.method.toUpperCase(),
        request.path
      );
      console.error('Message:', error.message);
      console.error('Database error code:', error.code || 'N/A');
      console.error('Database detail:', error.detail || 'N/A');
      console.error('Stack:', error.stack);
      console.error('======================================\n');

      message = 'An unexpected server error occurred.';
    }

    // PostgreSQL unique constraint violation.
    if (error.code === '23505') {
      statusCode = 409;
      message = 'A record with this unique value already exists.';
    }

    // PostgreSQL foreign key violation.
    if (error.code === '23503') {
      statusCode = 409;
      message = 'This operation conflicts with related records.';
    }

    // PostgreSQL NOT NULL constraint violation.
    if (error.code === '23502') {
      statusCode = 400;
      message = 'A required database field is missing.';
    }

    // PostgreSQL check constraint violation.
    if (error.code === '23514') {
      statusCode = 400;
      message = 'The supplied data violates a validation rule.';
    }

    // Return validation details for errors produced by our route validation.
    const responseBody = {
      status: 'error',
      message,
    };

    if (error.details) {
      responseBody.details = error.details;
    }

    return h.response(responseBody).code(statusCode).takeover();
  });

  // Health check.
  server.route({
    method: 'GET',
    path: '/api/v1/health',
    handler: async () => {
      const result = await pool.query('SELECT 1');

      return {
        status: 'success',
        message: 'News & Updates API is running.',
        database: result.rowCount === 1 ? 'connected' : 'unknown',
      };
    },
  });

  // Register API routes.
  server.route(categoryRoutes);
  server.route(newsRoutes);

  await server.start();

  console.log(`Server running at: ${server.info.uri}`);
  console.log('Health endpoint: /api/v1/health');
};

process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
});

init().catch(async (error) => {
  console.error('Failed to start server:', error.message);
  await pool.end();
  process.exit(1);
});