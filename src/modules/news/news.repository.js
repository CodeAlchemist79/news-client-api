
'use strict';

class NewsRepository {
  constructor(pool) {
    this.pool = pool;
  }

  // Retrieve articles with tag names from the normalized tables.
  async findAll() {
    const query = `
      SELECT
        n.id,
        n.category_id,
        n.title,
        n.slug,
        n.summary,
        n.content,
        n.status,
        COALESCE(
          ARRAY_AGG(t.name ORDER BY t.name)
            FILTER (WHERE t.id IS NOT NULL),
          ARRAY[]::varchar[]
        ) AS tag_names,
        n.published_at,
        n.created_at,
        n.updated_at
      FROM news_items AS n
      LEFT JOIN news_tags AS nt ON nt.news_id = n.id
      LEFT JOIN tags AS t ON t.id = nt.tag_id
      WHERE n.deleted_at IS NULL
      GROUP BY n.id
      ORDER BY n.created_at DESC;
    `;

    const { rows } = await this.pool.query(query);
    return rows;
  }

  async findById(id) {
    return this._findByIdWithTags(id, false);
  }

  // Internal helper for active and soft-deleted articles.
  async _findByIdWithTags(id, includeDeleted, database = this.pool) {
    const query = `
      SELECT
        n.id,
        n.category_id,
        n.title,
        n.slug,
        n.summary,
        n.content,
        n.status,
        COALESCE(
          ARRAY_AGG(t.name ORDER BY t.name)
            FILTER (WHERE t.id IS NOT NULL),
          ARRAY[]::varchar[]
        ) AS tag_names,
        n.published_at,
        n.created_at,
        n.updated_at,
        n.deleted_at
      FROM news_items AS n
      LEFT JOIN news_tags AS nt ON nt.news_id = n.id
      LEFT JOIN tags AS t ON t.id = nt.tag_id
      WHERE n.id = $1
        AND (
          ($2::boolean = TRUE AND n.deleted_at IS NOT NULL)
          OR
          ($2::boolean = FALSE AND n.deleted_at IS NULL)
        )
      GROUP BY n.id;
    `;

    const { rows } = await database.query(query, [
      id,
      includeDeleted,
    ]);

    return rows[0] || null;
  }

  // Find a tag by name or create it if it doesn't exist.
  async _getOrCreateTag(database, rawName) {
    const name = String(rawName).trim();

    if (!name || name.length > 80) {
      const error = new Error(
        'Each tag name must contain between 1 and 80 characters.'
      );
      error.statusCode = 400;
      throw error;
    }

    const existing = await database.query(
      `SELECT id FROM tags WHERE LOWER(name) = LOWER($1) LIMIT 1;`,
      [name]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }

    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);

    if (!baseSlug) {
      baseSlug = 'tag';
    }

    let candidateSlug = baseSlug;
    let suffix = 2;

    while (true) {
      const slugResult = await database.query(
        `SELECT id FROM tags WHERE slug = $1 LIMIT 1;`,
        [candidateSlug]
      );

      if (slugResult.rows.length === 0) {
        break;
      }

      candidateSlug =
        `${baseSlug.slice(0, 100 - String(suffix).length - 1)}-${suffix}`;
      suffix += 1;
    }

    const inserted = await database.query(
      `
        INSERT INTO tags (name, slug)
        VALUES ($1, $2)
        RETURNING id;
      `,
      [name, candidateSlug]
    );

    return inserted.rows[0].id;
  }

  // Replace an article's tag relationships within the current transaction.
  async _syncTags(database, newsId, tagNames = []) {
    const names = [
      ...new Map(
        (Array.isArray(tagNames) ? tagNames : [])
          .filter((name) => typeof name === 'string')
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLowerCase(), name])
      ).values(),
    ];

    await database.query(
      `DELETE FROM news_tags WHERE news_id = $1;`,
      [newsId]
    );

    for (const name of names) {
      const tagId = await this._getOrCreateTag(database, name);

      await database.query(
        `
          INSERT INTO news_tags (news_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT (news_id, tag_id) DO NOTHING;
        `,
        [newsId, tagId]
      );
    }
  }

  async create(article) {
    const database = await this.pool.connect();

    try {
      await database.query('BEGIN');

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
          $1, $2, $3, $4, $5, $6, $7,
          CASE
            WHEN $6::varchar = 'published' THEN NOW()
            ELSE NULL
          END
        )
        RETURNING id;
      `;

      const values = [
        article.category_id ?? null,
        article.title,
        article.slug,
        article.summary ?? null,
        article.content,
        article.status ?? 'draft',
        article.tag_names ?? [],
      ];

      const { rows } = await database.query(query, values);
      const newsId = rows[0].id;

      await this._syncTags(
        database,
        newsId,
        article.tag_names ?? []
      );

      await database.query('COMMIT');

      return await this._findByIdWithTags(newsId, false);
    } catch (error) {
      await database.query('ROLLBACK');
      throw error;
    } finally {
      database.release();
    }
  }

  async update(id, article) {
    const database = await this.pool.connect();

    try {
      await database.query('BEGIN');

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
        RETURNING id;
      `;

      const values = [
        article.category_id ?? null,
        article.title,
        article.slug,
        article.summary ?? null,
        article.content,
        article.status ?? 'draft',
        article.tag_names ?? [],
        id,
      ];

      const { rows } = await database.query(query, values);

      if (rows.length === 0) {
        await database.query('ROLLBACK');
        return null;
      }

      await this._syncTags(
        database,
        id,
        article.tag_names ?? []
      );

      await database.query('COMMIT');

      return await this._findByIdWithTags(id, false);
    } catch (error) {
      await database.query('ROLLBACK');
      throw error;
    } finally {
      database.release();
    }
  }

  async softDelete(id) {
    const query = `
      UPDATE news_items
      SET deleted_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING id;
    `;

    const { rows } = await this.pool.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return this._findByIdWithTags(id, true);
  }

  async findDeleted() {
    const query = `
      SELECT
        n.id,
        n.category_id,
        n.title,
        n.slug,
        n.summary,
        n.content,
        n.status,
        COALESCE(
          ARRAY_AGG(t.name ORDER BY t.name)
            FILTER (WHERE t.id IS NOT NULL),
          ARRAY[]::varchar[]
        ) AS tag_names,
        n.published_at,
        n.created_at,
        n.updated_at,
        n.deleted_at
      FROM news_items AS n
      LEFT JOIN news_tags AS nt ON nt.news_id = n.id
      LEFT JOIN tags AS t ON t.id = nt.tag_id
      WHERE n.deleted_at IS NOT NULL
      GROUP BY n.id
      ORDER BY n.deleted_at DESC;
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
      RETURNING id;
    `;

    const { rows } = await this.pool.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return this._findByIdWithTags(id, false);
  }
}

module.exports = NewsRepository;
