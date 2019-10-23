// @flow strict
import assert from 'assert'
import path from 'path'
import {
  degenString,
} from '../src/generator.js'

import { codeGen } from '../src/base-gen.js'

const generator = () => degenString()

const result = codeGen(
  __dirname,
  true,
  '',
  {
    'Foo': __filename,
  },
  { stringify: '../src/deserializer.js', deString: '../src/deserializer.js' },
  [
    [ './base-path-output.js', [['strict', generator() ]] ],
  ],
)[0][0]

assert.strictEqual(
  result,
  path.join(__dirname, 'base-path-output.js'),
  "baseDir should have been prepended to the filename"
)
