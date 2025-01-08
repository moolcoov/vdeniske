# VDeniske

![VDeniske logo](https://raw.githubusercontent.com/zethange/vdeniske/refs/heads/master/frontend/public/vdeniske.svg)  
A simple social media platform written in Rust/Axum and Solid.js.

## Features

- User registration
- User login
- User avatar upload
- User profile
- Post creation
- Likes/dislikes post

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [PostgreSQL](https://www.postgresql.org/download)
- [Bun](https://bun.sh)

### Start backend

```bash
export POSTGRES_URL="postgres://demo:demo@localhost:5432/vdeniske"
export POSTGRES_URL="$DATABASE_URL?sslmode=disable"
export MODE=DEV

dbmate up
cargo run
```
