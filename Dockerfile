FROM rust:1.83-slim AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {\n}" >> src/main.rs
RUN cargo fetch
RUN rm -rf src

COPY . .

# RUN apk update && apk add openssl-dev musl-dev
RUN apt-get update -y && apt-get install -y libssl-dev pkg-config
RUN cargo build -r

FROM debian:12-slim

WORKDIR /app
COPY --from=builder /app/target/release/vdeniske /app/entrypoint.sh ./
COPY db db
RUN chmod +x /app/vdeniske

RUN apt update -y && apt upgrade -y && apt install libssl-dev pkg-config curl -y
RUN curl -fsSL -o /usr/local/bin/dbmate https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64
RUN chmod +x /usr/local/bin/dbmate
RUN chmod +x /app/entrypoint.sh

CMD ["./entrypoint.sh"]
