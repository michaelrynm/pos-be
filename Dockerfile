# ========================================
# Base Stage - Dependencies
# ========================================
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ========================================
# Development Stage - Hot Reload
# ========================================
FROM base AS development

ENV NODE_ENV=development
ENV NPM_CONFIG_LOGLEVEL=warn

COPY . .

EXPOSE 3000 9229

CMD ["npm", "run", "start:dev"]

# ========================================
# Build Stage - For Production
# ========================================
FROM base AS build

COPY . .
RUN npm run build

# ========================================
# Production Stage
# ========================================
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
