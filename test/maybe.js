// @flow strict
import assert from 'assert'
import path from 'path'
import {
  degenMaybe,
  degenString,
} from '../src/generator.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

const stringType = { name: 'string', typeParams: [] }

const maybeStringGenerator = () => degenMaybe(stringType, degenString())

const maybeStringOutputFile = path.resolve(__dirname, 'maybe-output.js')

const code = codeGen(
  __dirname,
  '',
  {
  },
  {
    deString: '../src/deserializer.js',
  },
  [
    [ path.resolve(__dirname, 'maybe-output.js'), [[ 'maybeStringRefiner', maybeStringGenerator() ]] ],
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
