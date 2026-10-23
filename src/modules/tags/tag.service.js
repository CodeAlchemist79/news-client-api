
'use strict';

class TagService {
  constructor(tagRepository) {
    this.tagRepository = tagRepository;
  }

  validateId(id) {
    if (!/^[1-9]\d*$/.test(String(id))) {
      const error = new Error('Tag ID must be a positive integer.');
      error.statusCode = 400;
      throw error;
    }

    return id;
  }

  async getAllTags() {
    return this.tagRepository.findAll();
  }

  async getTagById(id) {
    this.validateId(id);

    const tag = await this.tagRepository.findById(id);

    if (!tag) {
      const error = new Error('Tag not found.');
      error.statusCode = 404;
      throw error;
    }

    return tag;
  }

  validateTag({ name, slug }) {
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      name.trim().length > 80
    ) {
      const error = new Error(
        'Tag name is required and must be between 2 and 80 characters.'
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof slug !== 'string' ||
      slug.trim().length < 2 ||
      slug.trim().length > 100 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())
    ) {
      const error = new Error(
        'Tag slug must be a valid URL-friendly string.'
      );
      error.statusCode = 400;
      throw error;
    }

    return {
      name: name.trim(),
      slug: slug.trim(),
    };
  }

  async ensureUnique({ name, slug }, currentId = null) {
    const existingName = await this.tagRepository.findByName(name);

    if (existingName && String(existingName.id) !== String(currentId)) {
      const error = new Error('A tag with this name already exists.');
      error.statusCode = 409;
      throw error;
    }

    const existingSlug = await this.tagRepository.findBySlug(slug);

    if (existingSlug && String(existingSlug.id) !== String(currentId)) {
      const error = new Error('A tag with this slug already exists.');
      error.statusCode = 409;
      throw error;
    }
  }

  async createTag(payload) {
    const tag = this.validateTag(payload);
    await this.ensureUnique(tag);

    return this.tagRepository.create(tag);
  }

  async updateTag(id, payload) {
    this.validateId(id);

    const existing = await this.tagRepository.findById(id);

    if (!existing) {
      const error = new Error('Tag not found.');
      error.statusCode = 404;
      throw error;
    }

    const tag = this.validateTag(payload);
    await this.ensureUnique(tag, id);

    return this.tagRepository.update(id, tag);
  }

  async deleteTag(id) {
    this.validateId(id);

    const existing = await this.tagRepository.findById(id);

    if (!existing) {
      const error = new Error('Tag not found.');
      error.statusCode = 404;
      throw error;
    }

    const inUse = await this.tagRepository.isInUse(id);

    if (inUse) {
      const error = new Error(
        'This tag is assigned to news articles and cannot be deleted.'
      );
      error.statusCode = 409;
      throw error;
    }

    return this.tagRepository.delete(id);
  }
}

module.exports = TagService;
