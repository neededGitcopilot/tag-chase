FROM node:20-alpine

WORKDIR /app

COPY ./packages ./packages
COPY ./yarn.lock ./yarn.lock
COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json

COPY ./apps/websocket ./apps/websocket

RUN yarn

EXPOSE 7000

CMD [ "yarn", "run", "dev"]


