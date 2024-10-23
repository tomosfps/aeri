FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN apk add --no-cache bash curl \
    && curl -o /usr/sbin/wait-for-it https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chown root:root /usr/sbin/wait-for-it \
    && chmod 755 /usr/sbin/wait-for-it

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY .env /app/packages/database
RUN pnpm run --filter database generate
RUN pnpm run -r build
RUN pnpm deploy --filter=gateway --prod /prod/gateway
RUN pnpm deploy --filter=handler --prod /prod/handler
RUN pnpm deploy --filter=database --prod /prod/database

FROM base AS database-setup
COPY --from=build /prod/database /prod/database
WORKDIR /prod/database
RUN corepack install
CMD [ "sh", "-cx", "wait-for-it database:5432 -- pnpm --silent push" ]

FROM base AS gateway
COPY --from=build /prod/gateway /prod/gateway
WORKDIR /prod/gateway
RUN corepack install
CMD [ "pnpm", "--silent", "start" ]

FROM base AS handler
COPY --from=build /prod/handler /prod/handler
WORKDIR /prod/handler
RUN corepack install
CMD [ "pnpm", "--silent", "start" ]