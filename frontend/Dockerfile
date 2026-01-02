# 1. Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install express

COPY --from=build /app/dist ./dist
COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]