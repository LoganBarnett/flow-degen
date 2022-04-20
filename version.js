#!/usr/bin/env node
/**
 * A CLI script for getting the minor version number of the package. Pass -n to
 * increment the version number.
 *
 * This is a Node.JS program to be platform agnostic an avoid some squirrelly
 * shell beavior.
 */
const fs = require('fs').promises
const process = require('process')

module.exports = {
  versionGet: () => {
    return fs.readFile('package.json', 'utf8')
      .then(JSON.parse)
      .then(p => p.version.split('.')[1])
      .then(parseInt)
  },
}

module.exports.versionGet()
  .then(v => v + process.argv.slice(2)[0] == '-n' ? 1 : 0)
  .then(console.log)
