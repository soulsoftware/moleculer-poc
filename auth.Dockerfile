FROM node:lts-alpine as soulsoftware-base

WORKDIR /app

COPY lerna.json .
COPY package.json package-lock.json ./
RUN npm install

FROM soulsoftware-base

WORKDIR /app/packages/common
COPY ./packages/common/build ./build
COPY ./packages/common/package.json ./package.json

WORKDIR /app/packages/auth
COPY ./packages/auth/build ./build
COPY ./packages/auth/package.json ./package.json

WORKDIR /app

RUN npm run bootstrap -- --production --no-optional

ENV NODE_ENV=production

CMD ["npm", "start"]