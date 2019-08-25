#! /usr/bin/env bash

set -e
# TODO: Link Flow github issue that shows how this workaround works.

rm -rf dist
mkdir -p dist

yarn babel -d dist/ src/*

cp src/index.js dist/index.js.flow
cp src/config.deserializer.js dist/config.deserializer.js.flow
cp src/base-gen.js dist/base-gen.js.flow

sed -i 's@\./@../src/@' dist/index.js.flow
sed -i 's@\./@../src/@' dist/config.deserializer.js.flow
sed -i 's@\./@../src/@' dist/base-gen.js.flow
