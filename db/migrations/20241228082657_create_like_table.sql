-- migrate:up
CREATE TABLE post_likes (
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- migrate:down
DROP TABLE post_likes;