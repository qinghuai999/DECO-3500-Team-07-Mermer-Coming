FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY app.js commands.js excuses.js utils.js excuses.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "app.js"]
