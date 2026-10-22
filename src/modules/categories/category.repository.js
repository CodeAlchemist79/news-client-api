
class CategoryRepository {
  constructor(database) {
    this.database = database;
  }

  async findAll() {
    const query = `
      SELECT id, name, slug, description, created_at
      FROM categories
      ORDER BY name ASC
    `;

    const result = await this.database.query(query);

    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT id, name, slug, description, created_at
      FROM categories
      WHERE id = $1
    `;

    const result = await this.database.query(query, [id]);

    return result.rows[0] || null;
  }

  async create({ name, slug, description = null }) {
    const query = `
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING id, name, slug, description, created_at
    `;

    const values = [name, slug, description];

    const result = await this.database.query(query, values);

    return result.rows[0];
  }

  async update(id, { name, slug, description = null }) {
    const query = `
      UPDATE categories
      SET
        name = $1,
        slug = $2,
        description = $3
      WHERE id = $4
      RETURNING id, name, slug, description, created_at
    `;

    const values = [name, slug, description, id];

    const result = await this.database.query(query, values);

    return result.rows[0] || null;
  }

  async delete(id) {
    const query = `
      DELETE FROM categories
      WHERE id = $1
      RETURNING id, name, slug, description, created_at
    `;

    const result = await this.database.query(query, [id]);

    return result.rows[0] || null;
  }
}

module.exports = CategoryRepository;
