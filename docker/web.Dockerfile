FROM node:20-alpine

WORKDIR /app

COPY package.json turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages ./packages

RUN yarn

COPY apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 9901

CMD [ "yarn","run", "dev", "--host"]
