FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm install

COPY . .

RUN npm run db:generate -w @aiscan/web
RUN npm run build -w @aiscan/web

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "npm run db:push -w @aiscan/web && npm run db:seed -w @aiscan/web && npm run start -w @aiscan/web"]
