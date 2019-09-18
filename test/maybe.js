// @flow strict
import assert from 'assert'
import path from 'path'
import {
  degenField,
  degenMaybe,
  degenObject,
  degenString,
} from '../src/generator.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

export type ParamType<T: string> = {
  foo: T,
}

const stringType = { name: 'string', typeParams: [] }
const paramTypeType = { name: 'ParamType', typeParams: [ stringType ] }

const maybeStringGenerator = () => degenMaybe(stringType, degenString())
const paramTypeGenerator = () => degenMaybe(paramTypeType, degenObject(
  paramTypeType,
  [
    degenField('foo', degenString()),
  ],
))

const code = codeGen(
  __dirname,
  '',
  {
    'ParamType': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'maybe-output.js'), [
        [ 'maybeStringRefiner', maybeStringGenerator() ],
        [ 'paramTypeRefiner', paramTypeGenerator() ],
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
