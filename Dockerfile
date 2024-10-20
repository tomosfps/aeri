FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin api

FROM debian:bookworm-slim AS api
WORKDIR /app
RUN apt-get update && apt-get install -y libssl-dev ca-certificates tzdata
COPY --from=builder /app/target/release/api /usr/local/bin
ENTRYPOINT ["/usr/local/bin/api"]
