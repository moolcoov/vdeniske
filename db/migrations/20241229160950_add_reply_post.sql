-- migrate:up
ALTER TABLE posts
ADD COLUMN reply_to UUID REFERENCES posts(id);
-- migrate:down
ALTER TABLE posts DROP COLUMN reply_to;