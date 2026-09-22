FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@11 && npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]