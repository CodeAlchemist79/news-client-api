
'use strict';

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

class NewsService {
  constructor(newsRepository) {
    this.newsRepository = newsRepository;
  }

  validateId(id) {
    if (!/^[1-9]\d*$/.test(String(id))) {
      const error = new Error(
        'News article ID must be a positive integer.'
      );
      error.statusCode = 400;
      throw error;
    }

    return id;
  }

  validateArticle(article, isUpdate = false) {
    if (
      !article ||
      typeof article !== 'object' ||
      Array.isArray(article)
    ) {
      const error = new Error(
        'A valid article object is required.'
      );
      error.statusCode = 400;
      throw error;
    }

    const allowedFields = [
      'category_id',
      'title',
      'slug',
      'summary',
      'content',
      'status',
      'tag_names',
    ];

    const unknownFields = Object.keys(article).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      const error = new Error(
        `Unsupported field(s): ${unknownFields.join(', ')}.`
      );
      error.statusCode = 400;
      throw error;
    }

    if (isUpdate || Object.hasOwn(article, 'title')) {
      if (
        typeof article.title !== 'string' ||
        !article.title.trim() ||
        article.title.trim().length > 200
      ) {
        const error = new Error(
          'Title is required and must not exceed 200 characters.'
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (article.slug !== undefined) {
      if (
        typeof article.slug !== 'string' ||
        !slugify(article.slug) ||
        slugify(article.slug).length > 220
      ) {
        const error = new Error(
          'Slug must be a valid URL-friendly string.'
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (
      article.category_id !== undefined &&
      article.category_id !== null &&
      !/^[1-9]\d*$/.test(String(article.category_id))
    ) {
      const error = new Error(
        'category_id must be a positive integer or null.'
      );
      error.statusCode = 400;
      throw error;
    }

    for (const field of ['summary', 'content']) {
      if (
        article[field] !== undefined &&
        article[field] !== null &&
        typeof article[field] !== 'string'
      ) {
        const error = new Error(
          `${field} must be a string or null.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (
      article.summary !== undefined &&
      article.summary !== null &&
      article.summary.length > 500
    ) {
      const error = new Error(
        'Summary must not exceed 500 characters.'
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      article.content !== undefined &&
      article.content !== null &&
      article.content.trim().length === 0
    ) {
      const error = new Error(
        'Content must not be empty.'
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      article.status !== undefined &&
      !['draft', 'published', 'archived'].includes(article.status)
    ) {
      const error = new Error(
        'Status must be draft, published, or archived.'
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      article.tag_names !== undefined &&
      (
        !Array.isArray(article.tag_names) ||
        article.tag_names.length > 50 ||
        !article.tag_names.every(
          (tag) =>
            typeof tag === 'string' &&
            tag.trim().length >= 1 &&
            tag.trim().length <= 80
        )
      )
    ) {
      const error = new Error(
        'tag_names must be an array of up to 50 tag names, each containing 1 to 80 characters.'
      );
      error.statusCode = 400;
      throw error;
    }

    const normalized = { ...article };

    if (normalized.title !== undefined) {
      normalized.title = normalized.title.trim();
    }

    if (normalized.slug !== undefined) {
      normalized.slug = slugify(normalized.slug);
    } else if (normalized.title !== undefined) {
      normalized.slug = slugify(normalized.title);
    }

    if (normalized.tag_names !== undefined) {
      normalized.tag_names = [
        ...new Map(
          normalized.tag_names
            .map((tag) => tag.trim())
            .map((tag) => [tag.toLowerCase(), tag])
        ).values(),
      ];
    }

    return normalized;
  }

  async getAllNews() {
    return this.newsRepository.findAll();
  }

  async getNewsById(id) {
    this.validateId(id);

    const article = await this.newsRepository.findById(id);

    if (!article) {
      const error = new Error('News article not found.');
      error.statusCode = 404;
      throw error;
    }

    return article;
  }

  async createNews(article) {
    const normalized = this.validateArticle(article);

    if (
      typeof normalized.title !== 'string' ||
      !normalized.title.trim()
    ) {
      const error = new Error('Title is required.');
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof normalized.content !== 'string' ||
      !normalized.content.trim()
    ) {
      const error = new Error('Content is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!normalized.slug) {
      normalized.slug = slugify(normalized.title);
    }

    return this.newsRepository.create(normalized);
  }

  async updateNews(id, article) {
    this.validateId(id);

    const existing = await this.newsRepository.findById(id);

    if (!existing) {
      const error = new Error('News article not found.');
      error.statusCode = 404;
      throw error;
    }

    const normalized = this.validateArticle(article, true);

    return this.newsRepository.update(id, {
      category_id:
        normalized.category_id !== undefined
          ? normalized.category_id
          : existing.category_id,

      title: normalized.title,

      slug:
        normalized.slug ||
        slugify(normalized.title),

      summary:
        normalized.summary !== undefined
          ? normalized.summary
          : existing.summary,

      content:
        normalized.content !== undefined
          ? normalized.content
          : existing.content,

      status:
        normalized.status !== undefined
          ? normalized.status
          : existing.status,

      tag_names:
        normalized.tag_names !== undefined
          ? normalized.tag_names
          : existing.tag_names,
    });
  }

  async deleteNews(id) {
    this.validateId(id);

    const deleted = await this.newsRepository.softDelete(id);

    if (!deleted) {
      const error = new Error(
        'Active news article not found.'
      );
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  }

  async getDeletedNews() {
    return this.newsRepository.findDeleted();
  }

  async restoreNews(id) {
    this.validateId(id);

    const restored = await this.newsRepository.restore(id);

    if (!restored) {
      const error = new Error(
        'Deleted news article not found.'
      );
      error.statusCode = 404;
      throw error;
    }

    return restored;
  }
}

module.exports = NewsService;
