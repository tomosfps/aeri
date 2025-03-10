FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN apk add --no-cache bash curl \
    && curl -o /usr/sbin/wait-for-it https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /usr/sbin/wait-for-it

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

FROM base AS packages
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages/ ./packages/
RUN find ./packages -type f -not -name "package.json" -delete
RUN find ./packages -type d -empty -delete

FROM base AS deps
WORKDIR /app
COPY --from=packages /app .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
ENV VITE_API_URL="https://api.aeri.live"
COPY . .
RUN pnpm run --filter database generate && \
    pnpm run -r build && \
    pnpm --filter=gateway --prod deploy /prod/gateway && \
    pnpm --filter=handler --prod deploy /prod/handler && \
    pnpm --filter=database --prod deploy /prod/database && \
    pnpm --filter=website --prod deploy /prod/website

FROM base AS database-setup
WORKDIR /prod/database
COPY --from=build /prod/database .
RUN corepack install
CMD [ "sh", "-cx", "wait-for-it database:5432 -- pnpm --silent push" ]

FROM base AS gateway
WORKDIR /prod/gateway
COPY --from=build /prod/gateway .
RUN corepack install
CMD [ "pnpm", "--silent", "start" ]

FROM base AS handler
WORKDIR /prod/handler
RUN apk add --no-cache openssl
COPY --from=build /prod/handler .
RUN corepack install
CMD [ "pnpm", "--silent", "start" ]

FROM nginx:alpine AS website
COPY --from=build /prod/website/dist /usr/share/nginx/html
CMD [ "nginx", "-g", "daemon off;" ]