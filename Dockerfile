FROM node:14
ENV DB_URL='' \
    DB_USER='mongo' \
    DB_PASSWORD='' \
    DB_NAME='cryptotracker' \
    REACT_APP_SERVER_URL='' \
    REACT_APP_DEFAULT_ADDRESS=''

WORKDIR /usr/src/app/react

COPY client/package.json ./
COPY client/yarn.lock ./

RUN yarn install

WORKDIR /usr/src/app

COPY server/package.json ./
COPY server/yarn.lock ./

RUN yarn install

COPY ./dockerentry.sh /dockerentry.sh

COPY server/ .

COPY client/ ./react

EXPOSE 3001

ENTRYPOINT /bin/bash /dockerentry.sh 