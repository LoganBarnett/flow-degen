// @flow strict

import assert from 'assert'
import path from 'path'
import {
  degenBool,
  degenField,
  degenNumber,
  degenObject,
  degenSentinelValue,
  degenString,
  degenSum,
  degenValue,
} from '../src/generator.js'
import { runFlow } from './utils.js'

import { codeGen } from '../src/base-gen.js'

export type Union =
  | Foo
  | Bar

export type UnionKind =
  | 'foo'
  | 'bar'

export type Foo = {
  kind: 'foo',
  a: string,
}

export type Bar = {
  kind: 'bar',
  b: number,
}

// Note that Baz is not in the union.
export type Baz = {
  kind: 'baz',
  c: bool,
}

const unionType = { name: 'Union', typeParams: [] }
const unionKindType = { name: 'UnionKind', typeParams: [] }
const fooType = { name: 'Foo', typeParams: [] }
const barType = { name: 'Bar', typeParams: [] }
const bazType = { name: 'Baz', typeParams: [] }

const generator = () => degenSum(unionType, 'kind', unionKindType, [
  degenSentinelValue('foo', degenObject(fooType, [
    degenField('a', degenString()),
    degenField('kind', degenValue('string', 'foo')),
  ])),
  degenSentinelValue('bar', degenObject(barType, [
    degenField('b', degenNumber()),
    degenField('kind', degenValue('string', 'bar')),
  ])),
  // This is the value we expect to cause a failure.
  degenSentinelValue('baz', degenObject(bazType, [
    degenField('c', degenBool()),
    degenField('kind', degenValue('string', 'baz')),
  ])),
])

const code = codeGen(
  __dirname,
  {
    'Union': __filename,
    'UnionKind': __filename,
    'Foo': __filename,
    'Bar': __filename,
    'Baz': __filename,
  },
  {
    stringify: '../src/deserializer.js',
    deString: '../src/deserializer.js',
    deField: '../src/deserializer.js',
    deNumber: '../src/deserializer.js',
    deBool: '../src/deserializer.js',
  },
  [
    [ path.resolve(__dirname, 'exhuastive-union-test-output.js'), generator() ],
  ],
)[0][1]

runFlow(code).then((errorText) => {
  assert.ok(
    errorText.match(/`Baz` \[1\] is incompatible with `Union` \[2\]./),
    'Expected error where type Baz is not in union type Union in:\n' + errorText,
  )
  assert.ok(
    errorText.match(/string literal `baz` \[1] is incompatible with enum \[2]./),
    'Expected error where "baz" literal is not in union UnionKind in:\n' + errorText,
  )
}).catch((e: mixed) => {
  console.error('Error running test:', e)
  process.exit(1)
})
