// @flow strict

import assert from 'assert'
import path from 'path'
import { degenString } from '../src/generator.js'
import { runFlow } from './utils.js'

import { codeGen } from '../src/base-gen.js'

const generator = () => degenString()

const code = codeGen(
  __dirname,
  '/* Preamble */',
  {},
  { stringify: '../src/deserializer.js', deString: '../src/deserializer.js' },
  [
    [ path.resolve(__dirname, 'preamble-output.js'), [[ 'preamble', generator() ]] ],
  ],
)[0][1]

assert.ok(
  code.match(/\/\* Preamble \*\//),
  'Expected to find "/* Preamble */" in the file: ' + code,
)
