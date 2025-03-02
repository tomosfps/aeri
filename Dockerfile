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
RUN pnpm run --filter database generate
RUN pnpm run -r build
RUN pnpm --filter=gateway --prod deploy /prod/gateway
RUN pnpm --filter=handler --prod deploy /prod/handler
RUN pnpm --filter=database --prod deploy /prod/database
RUN pnpm --filter=website --prod deploy /prod/website

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
RUN apk add --no-cache openssl
COPY --from=build /prod/handler /prod/handler
WORKDIR /prod/handler
RUN corepack install
CMD [ "pnpm", "--silent", "start" ]

FROM nginx:alpine AS website
COPY --from=build /prod/website/dist /usr/share/nginx/html
CMD [ "nginx", "-g", "daemon off;" ]