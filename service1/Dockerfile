FROM node:20-alpine AS builder

RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
# Rebuild native modules for the target platform
RUN npm rebuild bcrypt
RUN npm run build

FROM node:20-alpine AS runner

# Install build tools for native modules
RUN apk add --no-cache openssl build-base python3

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Install only production dependencies (this will compile bcrypt for the target platform)
RUN npm ci --only=production && npm cache clean --force

# Regenerate Prisma client for the target platform
RUN npx prisma generate

# Remove build tools to reduce image size
RUN apk del build-base python3

EXPOSE 3001 3003

CMD ["node", "dist/main"]


