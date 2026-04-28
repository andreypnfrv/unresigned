FROM node:24-slim AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src/
RUN yarn build

FROM node:24-slim
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --production --frozen-lockfile
COPY --from=builder /app/dist ./dist
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/index.js"]
