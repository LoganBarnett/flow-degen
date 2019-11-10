// @flow strict
import assert from 'assert'
import path from 'path'
import {
  degenField,
  degenMapping,
  degenObject,
  degenString,
} from '../src/index.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

// Workaround for https://github.com/LoganBarnett/flow-degen/issues/15
export type Container = {
  mapping: { [string]: string },
}

const containerMetaType = { name: 'Container', typeParams: [] }
const stringMetaType = { name: 'string', typeParams: [] }

const mappingContainerGenerator = () => degenObject(
  containerMetaType,
  [degenField('mapping', degenMapping(
    stringMetaType,
    stringMetaType,
    degenString(),
    degenString(),
  ))],
  [],
)

const code = codeGen(
  __dirname,
  true,
  '',
  {
    'Container': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deMapping: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'mapping-output.js'), [
        [ 'mappingContainerRefiner', mappingContainerGenerator() ],
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
