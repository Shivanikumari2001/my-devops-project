FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm --version && \
    ls -la package*.json && \
    npm ci --no-audit --no-fund || (echo "npm ci failed, trying npm install" && npm install --no-audit --no-fund)

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]

