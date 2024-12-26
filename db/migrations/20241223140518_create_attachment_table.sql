-- migrate:up
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    user_id UUID,
    post_id UUID,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- migrate:down
DROP TABLE attachments;
