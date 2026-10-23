
'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { createServer } = require('../src/server');

const { describe, it, before, after } = exports.lab = Lab.script();
const { expect } = Code;

let server;

describe('News & Updates API', () => {
  before(async () => {
    server = await createServer();
  });

  after(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('returns 404 for an unknown route', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/route-that-does-not-exist',
    });

    expect(response.statusCode).to.equal(404);
  });

  it('returns 400 for an invalid category ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/categories/abc',
    });

    expect(response.statusCode).to.equal(400);
    expect(response.result.status).to.equal('error');
  });

  it('returns 400 for an invalid news article ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/news/abc',
    });

    expect(response.statusCode).to.equal(400);
    expect(response.result.status).to.equal('error');
  });

  it('returns 400 for an invalid tag ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/tags/abc',
    });

    expect(response.statusCode).to.equal(400);
    expect(response.result.status).to.equal('error');
  });

  it('returns the tags collection successfully', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/tags',
    });

    expect(response.statusCode).to.equal(200);
    expect(response.result.status).to.equal('success');
    expect(response.result.data).to.exist();
    expect(response.result.data.tags).to.be.an.array();
    expect(response.result.results).to.equal(
      response.result.data.tags.length
    );
  });

  it('returns 200 when the health check succeeds', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(response.statusCode).to.equal(200);
    expect(response.result.status).to.equal('success');
    expect(response.result.database).to.equal('connected');
  });
});
