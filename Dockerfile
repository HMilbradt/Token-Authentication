FROM node:7
WORKDIR /app

COPY package.json /app
RUN npm install
COPY . /app

RUN npm rebuild bcrypt --build-from-source
CMD node server.js