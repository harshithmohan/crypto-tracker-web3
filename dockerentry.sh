#!/bin/bash

cd /usr/src/app

if [[ ! -d app ]]
then
  cd react
  yarn build
  mv build ../
  cd ..
  rm -r react
  mv build app
fi

yarn start