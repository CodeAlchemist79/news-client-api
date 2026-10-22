class NewsRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    const query = `
      SELECT
        id,
        category_id,
        title,
        slug,
        summary,
        content,
        status,
        tag_names,
        published_at,
        created_at,
        updated_at
      FROM news_items
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC;
    `;

    const { rows } = await this.pool.query(query);
    return rows;
  }

  async findById(id) {
    const query = `
      SELECT *
      FROM news_items
      WHERE id = $1
        AND deleted_at IS NULL;
    `;

    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  async create(article) {
    const query = `
      INSERT INTO news_items (
        category_id,
        title,
        slug,
        summary,
        content,
        status,
        tag_names,
        published_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        CASE
          WHEN $6::varchar = 'published' THEN NOW()
          ELSE NULL
        END
      )
      RETURNING *;
    `;

    const values = [
      article.category_id ?? null,
      article.title,
      article.slug,
      article.summary ?? null,
      article.content ?? null,
      article.status ?? 'draft',
      article.tag_names ?? [],
    ];

    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  async update(id, article) {
    const query = `
      UPDATE news_items
      SET
        category_id = $1,
        title = $2,
        slug = $3,
        summary = $4,
        content = $5,
        status = $6,
        tag_names = $7,
        published_at = CASE
          WHEN $6::varchar = 'published' AND published_at IS NULL
            THEN NOW()
          WHEN $6::varchar <> 'published'
            THEN NULL
          ELSE published_at
        END,
        updated_at = NOW()
      WHERE id = $8
        AND deleted_at IS NULL
      RETURNING *;
    `;

    const values = [
      article.category_id ?? null,
      article.title,
      article.slug,
      article.summary ?? null,
      article.content ?? null,
      article.status ?? 'draft',
      article.tag_names ?? [],
      id,
    ];

    const { rows } = await this.pool.query(query, values);
    return rows[0] || null;
  }

  async softDelete(id) {
    const query = `
      UPDATE news_items
      SET deleted_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING *;
    `;

    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  async findDeleted() {
    const query = `
      SELECT *
      FROM news_items
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC;
    `;

    const { rows } = await this.pool.query(query);
    return rows;
  }

  async restore(id) {
    const query = `
      UPDATE news_items
      SET deleted_at = NULL,
          updated_at = NOW()
      WHERE id = $1
        AND deleted_at IS NOT NULL
      RETURNING *;
    `;

    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = NewsRepository;