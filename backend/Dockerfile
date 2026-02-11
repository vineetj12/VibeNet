FROM node:18-alpine AS builder
WORKDIR /app

# Install deps (including dev deps for build)
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source and build
COPY . ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production || npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE 8081
CMD ["node", "dist/index.js"]
