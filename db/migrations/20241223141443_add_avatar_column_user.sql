-- migrate:up
ALTER TABLE users
ADD COLUMN avatar TEXT NOT NULL DEFAULT '';

-- migrate:down
ALTER TABLE users
DROP COLUMN avatar;
