
class CategoryController {
  constructor(categoryService) {
    this.categoryService = categoryService;
  }

  async getAll(request, h) {
    const categories = await this.categoryService.getAllCategories();

    return h.response({
      status: 'success',
      results: categories.length,
      data: { categories },
    }).code(200);
  }

  async getById(request, h) {
    const category = await this.categoryService.getCategoryById(
      request.params.id
    );

    return h.response({
      status: 'success',
      data: { category },
    }).code(200);
  }

  async create(request, h) {
    const category = await this.categoryService.createCategory(
      request.payload
    );

    return h.response({
      status: 'success',
      message: 'Category created successfully.',
      data: { category },
    }).code(201);
  }

  async update(request, h) {
    const category = await this.categoryService.updateCategory(
      request.params.id,
      request.payload
    );

    return h.response({
      status: 'success',
      message: 'Category updated successfully.',
      data: { category },
    }).code(200);
  }

  async delete(request, h) {
    const category = await this.categoryService.deleteCategory(
      request.params.id
    );

    return h.response({
      status: 'success',
      message: 'Category deleted successfully.',
      data: { category },
    }).code(200);
  }
}

module.exports = CategoryController;
