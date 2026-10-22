BEGIN;

-- Add soft-delete support to news articles.
ALTER TABLE news_items
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index active/deleted article filtering.
CREATE INDEX IF NOT EXISTS idx_news_items_deleted_at
ON news_items (deleted_at);

-- Remove Client Management completely.
DROP TABLE IF EXISTS clients;

COMMIT;
