-- Migration 003: Normalize news tags into a relational structure.
-- Existing news_items.tag_names data is preserved during migration.

BEGIN;

-- Create the many-to-many junction table.
CREATE TABLE IF NOT EXISTS news_tags (
    news_id BIGINT NOT NULL
        REFERENCES news_items(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL
        REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (news_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_news_tags_tag_id
    ON news_tags(tag_id);

-- Create missing tag records from existing article tag names.
-- The generated slug is URL-friendly and made unique when necessary.
DO $$
DECLARE
    tag_record RECORD;
    base_slug TEXT;
    candidate_slug TEXT;
    suffix INTEGER;
BEGIN
    FOR tag_record IN
        SELECT DISTINCT BTRIM(tag_name) AS name
        FROM news_items AS n
        CROSS JOIN LATERAL UNNEST(n.tag_names) AS expanded(tag_name)
        WHERE tag_name IS NOT NULL
          AND BTRIM(tag_name) <> ''
        ORDER BY BTRIM(tag_name)
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM tags
            WHERE LOWER(name) = LOWER(tag_record.name)
        ) THEN
            base_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(
                LOWER(tag_record.name),
                '[^a-z0-9]+',
                '-',
                'g'
            ));

            IF base_slug = '' THEN
                base_slug := 'tag';
            END IF;

            candidate_slug := LEFT(base_slug, 100);
            suffix := 1;

            WHILE EXISTS (
                SELECT 1
                FROM tags
                WHERE slug = candidate_slug
            ) LOOP
                suffix := suffix + 1;
                candidate_slug :=
                    LEFT(base_slug, 100 - LENGTH('-' || suffix))
                    || '-' || suffix;
            END LOOP;

            INSERT INTO tags (name, slug)
            VALUES (tag_record.name, candidate_slug);
        END IF;
    END LOOP;
END $$;

-- Connect every existing article to its corresponding tag record.
INSERT INTO news_tags (news_id, tag_id)
SELECT DISTINCT n.id, t.id
FROM news_items AS n
CROSS JOIN LATERAL UNNEST(n.tag_names) AS expanded(tag_name)
JOIN tags AS t
  ON LOWER(t.name) = LOWER(BTRIM(tag_name))
WHERE tag_name IS NOT NULL
  AND BTRIM(tag_name) <> ''
ON CONFLICT (news_id, tag_id) DO NOTHING;

COMMIT;