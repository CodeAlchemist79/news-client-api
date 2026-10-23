
'use strict';

class TagRepository {
  constructor(database) {
    this.database = database;
  }

  async findAll() {
    const query = `
      SELECT id, name, slug, created_at
      FROM tags
      ORDER BY name ASC;
    `;

    const { rows } = await this.database.query(query);
    return rows;
  }

  async findById(id) {
    const query = `
      SELECT id, name, slug, created_at
      FROM tags
      WHERE id = $1;
    `;

    const { rows } = await this.database.query(query, [id]);
    return rows[0] || null;
  }

  async findByName(name) {
    const query = `
      SELECT id, name, slug, created_at
      FROM tags
      WHERE LOWER(name) = LOWER($1);
    `;

    const { rows } = await this.database.query(query, [name]);
    return rows[0] || null;
  }

  async findBySlug(slug) {
    const query = `
      SELECT id, name, slug, created_at
      FROM tags
      WHERE slug = $1;
    `;

    const { rows } = await this.database.query(query, [slug]);
    return rows[0] || null;
  }

  async create({ name, slug }) {
    const query = `
      INSERT INTO tags (name, slug)
      VALUES ($1, $2)
      RETURNING id, name, slug, created_at;
    `;

    const { rows } = await this.database.query(query, [name, slug]);
    return rows[0];
  }

  async update(id, { name, slug }) {
    const query = `
      UPDATE tags
      SET name = $1,
          slug = $2
      WHERE id = $3
      RETURNING id, name, slug, created_at;
    `;

    const { rows } = await this.database.query(query, [name, slug, id]);
    return rows[0] || null;
  }

  async isInUse(id) {
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM news_tags
        WHERE tag_id = $1
      ) AS in_use;
    `;

    const { rows } = await this.database.query(query, [id]);
    return rows[0].in_use;
  }

  async delete(id) {
    const query = `
      DELETE FROM tags
      WHERE id = $1
      RETURNING id, name, slug, created_at;
    `;

    const { rows } = await this.database.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = TagRepository;
