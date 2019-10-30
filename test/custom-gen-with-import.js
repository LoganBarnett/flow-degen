// @flow strict
import assert from 'assert'
import path from 'path'
import {
  type DeImport,
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

type CustomImportTestType =
  | 'Foo'

type CustomImportTestImport =
  | 'importedFn'
  // adding DeImport to the union shouldn't be necessary (and wasn't necessary
  // in the real implementation this was adapted from), but flow isn't
  // recognizing deField and deString on lines 75 and 76 otherwise
  | DeImport

const customDegen = (
  refinerType: MetaType<CustomImportTestType, CustomImportTestImport>,
  refinerGenerator: DeserializerGenerator<CustomImportTestType, CustomImportTestImport>,
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
    mergeDeps<CustomImportTestType, CustomImportTestImport>(
      deps,
      { types: [], imports: ['importedFn'], hoists: [] },
    ),
  ]
}

const stringType = { name: 'string', typeParams: [] }
const fooType = { name: 'Foo', typeParams: [] }

const generator = () => customDegen(
  fooType,
  degenObject(fooType, [degenField('bar', degenString())], []),
)

const code = codeGen(
  __dirname,
  true,
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
      path.resolve(__dirname, 'custom-gen-with-import-output.js'), [
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
