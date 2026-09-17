FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm install typescript ts-node --save-dev && npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
