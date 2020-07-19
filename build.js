#!/usr/bin/env node
// @flow strict
/**
 * This file transpiles the src directory into dist, but also provides Flow
 * typings as part of the package. See
 * https://github.com/facebook/flow/issues/1996#issuecomment-228925018 for
 * background on this workaround.
 *
 * This file is written in JS to provide a platform agnostic means of managing
 * the build.
 */

const child_process = require('child_process')
const fs = require('fs').promises
const path = require('path')
const rimraf = require('rimraf')
const util = require('util')

/**
 * Copies a file to the dist directory in its original form but as a .flow file
 * to preserve its types.
 */
const copyToDistAsFlow = (source: string): Promise<mixed> => {
  return fs.copyFile(source, `dist/${path.basename(source) }.flow`)
}

const replaceInFile = (
  matcher: RegExp,
  replacer: string,
  path: string,
): Promise<mixed> => {
  return fs.readFile(path, 'utf8')
    .then(fileString => fileString.replace(matcher, replacer))
}

const shellCall = (exec: string, ...args: Array<string>): Promise<mixed> => {
  return new Promise((resolve, reject) => {
    const p = child_process.spawn(exec, args)
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.on('exit', code => code == 0 ? resolve() : reject(code))
  })
}

Promise.resolve()
  .then(() => fs.stat('dist'))
  .then(() => util.promisify(rimraf)('dist'))
  .catch(() => null)
  .then(() => fs.mkdir('dist'))
  .then(() => shellCall('node_modules/.bin/babel', '-d', 'dist', 'src'))
/**
 * This file copy was added to work around an issue with Flow strict. The cause
 * is not well understood and this doesn't seem to fix all cases of using Flow's
 * stirct mode. Furthermore, it breaks projects that do not use Flow strict. The
 * root ./index.js.flow workaround (see below) fixes the problem. These fixes
 * can coexist.
 */
  .then(fs.copyFile.bind(null, 'src/index.js', 'index.js.flow'))
  .then(fs.copyFile.bind(null, 'src/index.js', 'dist/index.js.flow'))
/**
 * When doing import {...} from 'flow-degen', Flow looks at the root directory
 * first, and finds index.js.flow. It's just a copy of our original
 * src/index.js, but the paths have been renamed to look into our src directory,
 * which hasn't been transformed by babel yet. Since the .flow file is
 * recognizable only by Flow, Flow will follow this import chain into the src
 * directory where it can pick up more types from the untransformed code. The
 * runtime import chain will still follow into the dist directory as intended.
 */
  .then(() => replaceInFile(/\.\//, './src/', 'index.js.flow'))
  .then(() => fs.readdir('src')
    .then(files => Promise.all(files
      /**
       * Don't do this with index.js, because we just handled it as a special
       * case above.
       */
      .filter(f => !f.endsWith('index.js'))
      .map(f => Promise.all([
        copyToDistAsFlow('src/' + f),
        fs.copyFile('src/' + f, 'dist/' + f).then(() => {
          return replaceInFile(/\.\//, '../src/', 'dist/' + path.basename(f))
        }),
      ]),
    )))
  )
  .catch(e => {
    console.error('Encountered error during build:', e)
    process.exit(1)
  })
