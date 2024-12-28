-- migrate:up
ALTER TABLE posts
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
UPDATE posts
SET created_at = NOW()
WHERE created_at IS NULL;
-- migrate:down
ALTER TABLE posts DROP COLUMN created_at;