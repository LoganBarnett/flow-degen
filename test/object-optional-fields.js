// @flow strict

import assert from 'assert'
import path from 'path'
import {
  degenField,
  degenNumber,
  degenObject,
  degenString,
} from '../src/generator.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

export type Obj = {
  required: string,
  optional?: number,
}

const objType = { name: 'Obj', typeParams: [] }
const objGenerator = () => degenObject(objType, [
  degenField('required', degenString()),
], [
  degenField('optional', degenNumber()),
])

const code = codeGen(
  __dirname,
  true,
  '',
  {
    'Obj': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deNumber: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'object-optional-fields-output.js'), [
        [ 'objRefiner', objGenerator() ],
      ],
    ],
  ],
)[0][1]

runFlow(code).then((errorText) => {
  assert.ok(
    errorText.match(/No errors!/),
    'Expected no errors in flow check but got errors:' + errorText,
  )
}).catch((e: mixed) => {
  console.error('Error running test:', e)
  process.exit(1)
})
