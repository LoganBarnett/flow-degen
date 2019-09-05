#! /usr/bin/env bash

set -e
# This file transpiles the src directory into dist, but also provides Flow
# typings as part of the package. See
# https://github.com/facebook/flow/issues/1996#issuecomment-228925018 for
# background on this workaround.

rm -rf dist
mkdir -p dist

yarn babel -d dist/ src/*

# This was added to work around an issue with Flow strict. The cause is not well
# understood and this doesn't seem to fix all cases of using Flow's stirct mode.
# Furthermore, it breaks projects that do not use Flow strict. The root
# ./index.js.flow workaround (see below) fixes the problem. These fixes can
# coexist.
cp src/index.js dist/index.js.flow
# When doing import {...} from 'flow-degen', Flow looks at the root directory
# first, and finds index.js.flow. It's just a copy of our original src/index.js,
# but the paths have been renamed to look into our src directory, which hasn't
# been transformed by babel yet. Since the .flow file is recognizable only by
# Flow, Flow will follow this import chain into the src directory where it can
# pick up more types from the untransformed code. The runtime import chain will
# still follow into the dist directory as intended.
cp src/index.js index.js.flow
cp src/config.deserializer.js dist/config.deserializer.js.flow
cp src/base-gen.js dist/base-gen.js.flow

sed -i 's@\./@./src/@' index.js.flow
sed -i 's@\./@../src/@' dist/index.js.flow
sed -i 's@\./@../src/@' dist/config.deserializer.js.flow
sed -i 's@\./@../src/@' dist/base-gen.js.flow
