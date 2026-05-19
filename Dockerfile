FROM node:24.15.0-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN chmod -R 755 node_modules/.bin && npm run build

FROM node:24.15.0-alpine AS production
WORKDIR /app

RUN mkdir -p uploads

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
