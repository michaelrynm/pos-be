# DOCKERFILE FOR PRODUCTION

FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy source code to /app
COPY . .
RUN npm run build

CMD ["npm", "run", "start:dev"]

#improve jadi multistage dengan nerapin node:20 AS runner
