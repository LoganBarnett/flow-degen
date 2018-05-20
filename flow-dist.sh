#! /usr/bin/env bash

rm -rf dist
mkdir -p dist

yarn babel -d dist/ src/*

cp src/index.js index.js.flow

sed -i 's@\./@./src/@' index.js.flow
