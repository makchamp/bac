FROM node:18.16.1-alpine3.17

WORKDIR /usr/src/scattegories/

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001
ENTRYPOINT npm run start