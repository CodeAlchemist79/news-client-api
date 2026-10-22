
class CategoryService {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAllCategories() {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const categoryId = Number(id);

    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
      const error = new Error('Category ID must be a positive integer.');
      error.statusCode = 400;
      throw error;
    }

    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  async createCategory({ name, slug, description = null }) {
    if (typeof name !== 'string' || !name.trim()) {
      const error = new Error('Category name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (typeof slug !== 'string' || !slug.trim()) {
      const error = new Error('Category slug is required.');
      error.statusCode = 400;
      throw error;
    }

    return this.categoryRepository.create({
      name: name.trim(),
      slug: slug.trim(),
      description:
        typeof description === 'string' && description.trim()
          ? description.trim()
          : null,
    });
  }

  async updateCategory(id, { name, slug, description = null }) {
    const categoryId = Number(id);

    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
      const error = new Error('Category ID must be a positive integer.');
      error.statusCode = 400;
      throw error;
    }

    const existingCategory =
      await this.categoryRepository.findById(categoryId);

    if (!existingCategory) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    if (typeof name !== 'string' || !name.trim()) {
      const error = new Error('Category name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (typeof slug !== 'string' || !slug.trim()) {
      const error = new Error('Category slug is required.');
      error.statusCode = 400;
      throw error;
    }

    return this.categoryRepository.update(categoryId, {
      name: name.trim(),
      slug: slug.trim(),
      description:
        typeof description === 'string' && description.trim()
          ? description.trim()
          : null,
    });
  }

  async deleteCategory(id) {
    const categoryId = Number(id);

    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
      const error = new Error('Category ID must be a positive integer.');
      error.statusCode = 400;
      throw error;
    }

    const existingCategory =
      await this.categoryRepository.findById(categoryId);

    if (!existingCategory) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    return this.categoryRepository.delete(categoryId);
  }
}

module.exports = CategoryService;
