
'use strict';

class TagController {
  constructor(tagService) {
    this.tagService = tagService;
  }

  async getAll(request, h) {
    const tags = await this.tagService.getAllTags();

    return h.response({
      status: 'success',
      results: tags.length,
      data: { tags },
    }).code(200);
  }

  async getById(request, h) {
    const tag = await this.tagService.getTagById(
      request.params.id
    );

    return h.response({
      status: 'success',
      data: { tag },
    }).code(200);
  }

  async create(request, h) {
    const tag = await this.tagService.createTag(
      request.payload
    );

    return h.response({
      status: 'success',
      message: 'Tag created successfully.',
      data: { tag },
    }).code(201);
  }

  async update(request, h) {
    const tag = await this.tagService.updateTag(
      request.params.id,
      request.payload
    );

    return h.response({
      status: 'success',
      message: 'Tag updated successfully.',
      data: { tag },
    }).code(200);
  }

  async delete(request, h) {
    const tag = await this.tagService.deleteTag(
      request.params.id
    );

    return h.response({
      status: 'success',
      message: 'Tag deleted successfully.',
      data: { tag },
    }).code(200);
  }
}

module.exports = TagController;
