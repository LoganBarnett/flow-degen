// @flow strict
import assert from 'assert'
import path from 'path'
import {
  degenField,
  degenList,
  degenObject,
  degenString,
} from '../src/generator.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

// Test $ElementType<T, K>, e.g. $ElementType<ElementTypeTest, number>
export type ElementTypeTest = Array<{
  foo: string,
}>

export type ElementTypeTestContainer = {
  bar: ElementTypeTest,
}

const numberType = { name: '1', literal: true }
const elementTypeTestType = { name: 'ElementTypeTest' }
const elementTypeTestContainerType = { name: 'ElementTypeTestContainer' }
const elementTypeTestElementType = { name: '$ElementType', typeParams: [ elementTypeTestType, numberType ] }

const elementTypeTestContainerGenerator = () => degenObject(
  elementTypeTestContainerType,
  [
    degenField('bar', degenList(elementTypeTestElementType,
      degenObject(elementTypeTestElementType, [
        degenField('foo', degenString()),
      ], [])
    ))
  ], []
)

const elementTypeTestCode = codeGen(
  __dirname,
  true,
  '',
  {
    'ElementTypeTest': __filename,
    'ElementTypeTestContainer': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deList: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'flow-utility-types-output.js'), [
        [ 'elementTypeTestContainerRefiner', elementTypeTestContainerGenerator() ],
      ],
    ],
  ],
)[0][1]

runFlow(elementTypeTestCode).then((errorText) => {
  assert.ok(
    errorText.match(/No errors!/),
    'Expected no errors in flow check but got errors:' + errorText,
  )
}).catch((e: mixed) => {
  console.error('Error running test:', e)
  process.exit(1)
})

// Test $PropertyType<T, k>, e.g. $PropertyType<PropertyTypeTest, 'foo'>
export type PropertyTypeTest = {
  foo: {
    bar: string,
  }
}

const propertyTypeTestType = { name: 'PropertyTypeTest' }
const fooPropertyName = { name: "'foo'", literal: true }
const propertyTypeTestFooPropertyType = { name: '$PropertyType', typeParams: [ propertyTypeTestType, fooPropertyName ] }

const propertyTypeTestGenerator = () => degenObject(
  propertyTypeTestType,
  [
    degenField('foo', degenObject(propertyTypeTestFooPropertyType, [
      degenField('bar', degenString())
    ], []))
  ], [],
)

const propertyTypeTestCode = codeGen(
  __dirname,
  true,
  '',
  {
    'PropertyTypeTest': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'flow-utility-types-output.js'), [
        [ 'propertyTypeTestRefiner', propertyTypeTestGenerator() ],
      ],
    ],
  ],
)[0][1]

runFlow(propertyTypeTestCode).then((errorText) => {
  assert.ok(
    errorText.match(/No errors!/),
    'Expected no errors in flow check but got errors:' + errorText,
  )
}).catch((e: mixed) => {
  console.error('Error running test:', e)
  process.exit(1)
})

// Test $NonMaybeType<T>, e.g. $ElementType<$NonMaybeType<$PropertyType<NonMaybeTypeTest, 'foo'>>, number>
export type NonMaybeTypeTest = {
  foo?: Array<{
    bar: string,
  }>
}

const nonMaybeTypeTestType = { name: 'NonMaybeTypeTest' }
const nonMaybeTypeTestFooPropertyType = { name: '$PropertyType', typeParams: [ nonMaybeTypeTestType, fooPropertyName ] }
const nonMaybeTypeTestNonMaybeType = { name: '$NonMaybeType', typeParams: [nonMaybeTypeTestFooPropertyType] }
const nonMaybeTypeTestElementType = { name: '$ElementType', typeParams: [nonMaybeTypeTestNonMaybeType, numberType] }

const nonMaybeTypeTestGenerator = () => degenObject(
  nonMaybeTypeTestType,
  [], [
    degenField('foo', degenList(nonMaybeTypeTestElementType,
      degenObject(nonMaybeTypeTestElementType, [
        degenField('bar', degenString())
      ], [])))
  ],
)

const nonMaybeTypeTestCode = codeGen(
  __dirname,
  true,
  '',
  {
    'NonMaybeTypeTest': __filename,
  },
  {
    deField: '../src/deserializer.js',
    deList: '../src/deserializer.js',
    deString: '../src/deserializer.js',
  },
  [
    [
      path.resolve(__dirname, 'flow-utility-types-output.js'), [
        [ 'nonMaybeTypeTestRefiner', nonMaybeTypeTestGenerator() ],
      ],
    ],
  ],
)[0][1]

runFlow(nonMaybeTypeTestCode).then((errorText) => {
  assert.ok(
    errorText.match(/No errors!/),
    'Expected no errors in flow check but got errors:' + errorText,
  )
}).catch((e: mixed) => {
  console.error('Error running test:', e)
  process.exit(1)
})
