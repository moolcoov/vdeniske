-- migrate:up
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- migrate:down
DROP TABLE posts;
