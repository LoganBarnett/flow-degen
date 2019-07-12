#! /usr/bin/env bash

set -e
# TODO: Link Flow github issue that shows how this workaround works.

rm -rf dist
mkdir -p dist

yarn babel -d dist/ src/*

cp src/index.js index.js.flow

sed -i 's@\./@./src/@' index.js.flow
