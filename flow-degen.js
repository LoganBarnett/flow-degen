#! /usr/bin/env node
// @flow strict

import { typeof fileGen as FileGen } from './src/base-gen.js'
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

const fileGen: FileGen<string, string> = require('./dist/base-gen.js').fileGen
const configDeserializer = require('./dist/config.deserializer.js').deConfig

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
    const baseDir = configFile.baseDir || process.env.PWD || ''
    const generators = R.map(
      (generator) => {
        const module = require(
          path.resolve(baseDir, generator.inputFile),
        )
        return [
          generator.outputFile,
          R.map(
            k => [ generator.exports[k], module[k]() ],
            R.filter(
              k => R.keys(generator.exports).includes(k),
              R.keys(module),
            ),
          ),
        ]
      },
      configFile.generators,
    )

    fileGen(
      configFile.baseDir,
      // TODO: Let's bundle this up into the config file and reduce the args
      // here.
      true,
      configFile.generatedPreamble,
      configFile.typeLocations,
      R.merge(
        configFile.importLocations,
        R.mergeAll(
          R.reduce(
            R.concat,
            [],
            R.map(g => {
              return R.map(e => ({ [e]: g.outputFile }), R.values(g.exports))
            }, configFile.generators),
          ),
        ),
      ),
      generators,
    )
  }
}
