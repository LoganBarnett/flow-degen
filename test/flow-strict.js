// @flow strict
import assert from 'assert'
import path from 'path'
import { degenString } from '../src/generator.js'
import { runFlow } from './utils.js'

import { codeGen } from '../src/base-gen.js'

const generator = () => degenString()

const code = codeGen(
  __dirname,
  true,
  '',
  {},
  { stringify: '../src/deserializer.js', deString: '../src/deserializer.js' },
  [
    [ path.resolve(__dirname, 'flow-strict-output.js'), [['strict', generator() ]] ],
  ],
)[0][1]

assert.ok(
  code.match(/\/\/ @flow strict/),
  'Expected to find "// @flow strict" in the file.',
)
