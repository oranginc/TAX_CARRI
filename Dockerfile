# Google Cloud Run向け最適化Dockerfile（完全修正版）
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY .env.production .env.production
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV production
ENV PORT 8080

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE $PORT
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:$PORT/api/healthz || exit 1

CMD ["node", "server.js"]