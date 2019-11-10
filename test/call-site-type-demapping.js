// @flow strict
import assert from 'assert'
import path from 'path'
import {
  degenMapping,
  degenRefiner,
  degenString,
  deNumber,
} from '../src/index.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

// This issue is easily reproduced with opaque types, but other, more
// complicated types can also produce it.
export opaque type Celcius = number

export const refineCelcius = (x: mixed): Celcius | Error => {
  return deNumber(x)
}

const celciusType = { name: 'Celcius', typeParams: [] }

export const genRefineCelciusMapping = () => degenMapping<string, string>(
  { name: 'string', typeParams: [] },
  celciusType,
  degenString(),
  degenRefiner(celciusType, 'refineCelcius'),
)

const code = codeGen(
  __dirname,
  true,
  '',
  {
    'Celcius': __filename,
  },
  {
    deMapping: '../src/deserializer.js',
    deNumber: '../src/deserializer.js',
    deString: '../src/deserializer.js',
    refineCelcius: __filename,
  },
  [
    [
      path.resolve(__dirname, 'call-site-type-demapping-output.js'), [
        [ 'reCelciusMapping', genRefineCelciusMapping() ],
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
