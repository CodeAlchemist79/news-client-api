
class NewsController {
  constructor(newsService) {
    this.newsService = newsService;
  }

  async getAll(request, h) {
    const articles = await this.newsService.getAllNews();

    return h.response({
      status: 'success',
      results: articles.length,
      data: articles,
    }).code(200);
  }

  async getById(request, h) {
    const article = await this.newsService.getNewsById(
      request.params.id
    );

    return h.response({
      status: 'success',
      data: article,
    }).code(200);
  }

  async create(request, h) {
    const article = await this.newsService.createNews(
      request.payload
    );

    return h.response({
      status: 'success',
      message: 'News article created successfully.',
      data: article,
    }).code(201);
  }

  async update(request, h) {
    const article = await this.newsService.updateNews(
      request.params.id,
      request.payload
    );

    return h.response({
      status: 'success',
      message: 'News article updated successfully.',
      data: article,
    }).code(200);
  }

  async delete(request, h) {
    const article = await this.newsService.deleteNews(
      request.params.id
    );

    return h.response({
      status: 'success',
      message: 'News article soft-deleted successfully.',
      data: article,
    }).code(200);
  }

  async getDeleted(request, h) {
    const articles = await this.newsService.getDeletedNews();

    return h.response({
      status: 'success',
      results: articles.length,
      data: articles,
    }).code(200);
  }

  async restore(request, h) {
    const article = await this.newsService.restoreNews(
      request.params.id
    );

    return h.response({
      status: 'success',
      message: 'News article restored successfully.',
      data: article,
    }).code(200);
  }
}

module.exports = NewsController;
