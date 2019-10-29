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

export type MixedObj = {
  required: string,
  optional?: number,
}

const mixedObjType = { name: 'MixedObj', typeParams: [] }
const mixedObjGenerator = () => degenObject(mixedObjType, [
  degenField('required', degenString()),
], [
  degenField('optional', degenNumber()),
])

const codeWithRequired = codeGen(
  __dirname,
  true,
  '',
  {
    'MixedObj': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deNumber: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'object-optional-fields-output.js'), [
        [ 'mixedObjRefiner', mixedObjGenerator() ],
      ],
    ],
  ],
)[0][1]

runFlow(codeWithRequired).then((errorText) => {
  assert.ok(
    errorText.match(/No errors!/),
    'Expected no errors in flow check but got errors:' + errorText,
  )
}).catch((e: mixed) => {
  console.error('Error running test:', e)
  process.exit(1)
})

export type OptionalObj = {
  optional?: number,
  optionalAlso?: string,
}

const optionalObjType = { name: 'OptionalObj', typeParams: [] }
const optionalObjGenerator = () => degenObject(optionalObjType, [
], [
  degenField('optional', degenNumber()),
  degenField('optionalALso', degenString()),
])

const codeSansRequired = codeGen(
  __dirname,
  true,
  '',
  {
    'OptionalObj': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deNumber: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'object-optional-fields-output.js'), [
        [ 'optionalObjRefiner', optionalObjGenerator() ],
      ],
    ],
  ],
)[0][1]

runFlow(codeSansRequired).then((errorText) => {
  assert.ok(
    errorText.match(/No errors!/),
    'Expected no errors in flow check but got errors:' + errorText,
  )
}).catch((e: mixed) => {
  console.error('Error running test:', e)
  process.exit(1)
})
