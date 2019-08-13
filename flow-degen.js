#! /usr/bin/env node
// @flow strict

const fs = require('fs')
const path = require('path')
// All of the files used here are transpiled, but this helps with consuming
// files provided by the library consumer.
const babelConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './.babelrc'), 'utf8')
)

babelConfig.babelrcRoots = __dirname
babelConfig.ignore = [
  path.resolve(__dirname, '.git'),
  path.resolve(__dirname, 'flow-typed'),
  path.resolve(__dirname, 'node_modules'),
]

require('@babel/register')(babelConfig)

const R = require('ramda')

// We can't really type check against these results. If we export fileGen as
// part of the library's proper interface, we should be able to achieve type
// safety again.
const fileGen = require('./dist/base-gen.js').fileGen
const configDeserializer = require('./dist/config.deserializer.js').default

const configPath = process.argv[2]
if(typeof configPath != 'string') {
  console.error('usage: flow-degen config-file.json')
  process.exit(1)
}
else {
  const configFile = configDeserializer(
    JSON.parse(fs.readFileSync(configPath, 'utf8')),
  )

  if(configFile instanceof Error) {
    console.error('Error deserializing config file', configFile)
    process.exit(1)
  }
  else {
    const generators = R.map(
      ([out, p]) => [
        out,
        require(path.resolve(process.env.PWD || '', p)).default(),
      ],
      configFile.generators,
    )

    fileGen(
      configFile.baseDir,
      configFile.generatedPreamble,
      configFile.typeLocations,
      configFile.importLocations,
      generators,
    )
  }
}
