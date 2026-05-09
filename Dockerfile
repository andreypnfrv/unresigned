# syntax=docker/dockerfile:1.6
FROM node:24.13.0-bookworm

ENV IS_DOCKER=true \
    NODE_ENV=production \
    HOME=/usr/src/app \
    YARN_ENABLE_GLOBAL_CACHE=false \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

RUN apt-get update && apt-get install -y --no-install-recommends bsdmainutils \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sSLo /usr/local/bin/transcrypt https://raw.githubusercontent.com/elasticdog/transcrypt/2f905dce485114fec10fb747443027c0f9119caa/transcrypt \
  && chmod +x /usr/local/bin/transcrypt

WORKDIR /usr/src/app

# Only lockfiles and files yarn needs for install — invalidates rarely vs full COPY . .
COPY package.json yarn.lock .yarnrc.yml ./
COPY ckEditor/package.json ./ckEditor/package.json
COPY scripts/postinstall.sh ./scripts/postinstall.sh
COPY eslint-plugin-local ./eslint-plugin-local
COPY .yarn/install-state.gz ./.yarn/install-state.gz

ARG HOCUSPOCUS_URL=""
ENV HOCUSPOCUS_URL=${HOCUSPOCUS_URL}

ENV ENV_NAME=prodAntimortality \
    FORUM_TYPE=Antimortality

RUN --mount=type=cache,id=s/6ddb487b-d357-4204-b0e7-9d7c1614828e-/usr/src/app/.yarn/cache,target=/usr/src/app/.yarn/cache \
    yarn install \
  && rm -rf node_modules/@types/mapbox-gl node_modules/@types/simpl-schema \
    ckEditor/node_modules/@types/mapbox-gl ckEditor/node_modules/@types/simpl-schema

COPY . .

RUN --mount=type=cache,id=s/6ddb487b-d357-4204-b0e7-9d7c1614828e-/usr/src/app/.yarn/cache,target=/usr/src/app/.yarn/cache \
    yarn workspace @lesswrong/lesswrong-editor run build

RUN --mount=type=cache,id=s/6ddb487b-d357-4204-b0e7-9d7c1614828e-/usr/src/app/.next/cache,target=/usr/src/app/.next/cache \
    yarn build \
  && chmod +x scripts/docker-entrypoint.sh

EXPOSE 8080
ENV PORT=8080
CMD ["scripts/docker-entrypoint.sh"]
