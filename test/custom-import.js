// @flow strict
import assert from 'assert'
import path from 'path'
import {
  type DeserializerGenerator,
  type MetaType,
  degenField,
  degenObject,
  degenString,
  mergeDeps,
  typeHeader,
} from '../src/index.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

export type Foo = {
  bar: string,
}

export const importedFn = (): Foo => {
   return {
     bar: 'default'
   }
 }

const customDegen = <CustomType: string, CustomImport: string>(
  refinerType: MetaType<CustomType, CustomImport>,
  refinerGenerator: DeserializerGenerator<CustomType, CustomImport>,
) => {
  const [refinerCode, deps] = refinerGenerator
  const header = typeHeader(refinerType)

  return [
    () => {
      return `
        (x: mixed): ${header} | Error => {
          const refiner = ${refinerCode()}
          return refiner(importedFn())
        }
      `
    },
    mergeDeps<CustomType, CustomImport>(
      deps,
      { types: [], imports: ['importedFn'], hoists: [] },
    ),
  ]
}

const stringType = { name: 'string', typeParams: [] }
const fooType = { name: 'Foo', typeParams: [] }

const generator = () => customDegen<string, string>(
  fooType,
  degenObject(fooType, [degenField('bar', degenString())]),
)

const code = codeGen(
  __dirname,
  '',
  {
    'Foo': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deString: '../src/deserializer.js',
    importedFn: __filename,
  },
  [
    [
      path.resolve(__dirname, 'custom-import-output.js'), [
        [ 'refine', generator() ],
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
