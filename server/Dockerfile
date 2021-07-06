FROM node:14
ENV DB_URL='' \
    DB_USER='mongo' \
    DB_PASSWORD='' \
    DB_NAME='cryptotracker'

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3001
CMD [ "yarn", "start" ]