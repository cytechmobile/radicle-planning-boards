ARG NODE_VERSION=20
ARG CADDY_VERSION="2.8"
ARG NUXT_PUBLIC_PARENT_ORIGIN

FROM node:${NODE_VERSION}-slim AS build
# corepack is an experimental feature in Node.js v20 which allows
# installing and managing versions of pnpm, npm, yarn
RUN corepack enable

WORKDIR /src

COPY . ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV NODE_ENV=production
RUN pnpm build

FROM caddy:${CADDY_VERSION}-alpine

COPY --from=build /src/.output/public /usr/share/caddy

