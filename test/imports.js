// @flow strict
import assert from 'assert'
import path from 'path'
import {
  degenField,
  degenRefiner,
  degenObject,
  degenString,
  degenValue,
} from '../src/generator.js'
import { runFlow } from './utils.js'
import { codeGen } from '../src/base-gen.js'

export type Foo = {
  a: string,
}

export type Bar = {
  b: Foo,
}

export type Baz = {
  c: Bar,
}

const fooType = { name: 'Foo', typeParams: [] }
const barType = { name: 'Bar', typeParams: [] }
const bazType = { name: 'Baz', typeParams: [] }

const fooGenerator = () => degenObject(fooType, [
    degenField('a', degenString()),
  ])

const barGenerator = () => degenObject(barType, [
    degenField('b', degenRefiner('deFoo')),
    degenField('bb', degenRefiner('deBaz'))
  ])

const bazGenerator = () => degenObject(bazType, [
    degenField('c', degenString()),
  ])

const fooBarOutputFile = path.resolve(__dirname, 'foobar-imports-output.js')
const bazOutputFile = path.resolve(__dirname, 'baz-imports-output.js')

const code = codeGen(
  __dirname,
  '',
  {
    "Foo": __filename,
    "Bar": __filename,
  },
  {
    stringify: '../src/deserializer.js',
    deString: '../src/deserializer.js',
    deField: '../src/deserializer.js',
    // flow-degen.js puts these in normally
    deFoo: fooBarOutputFile,
    deBar: fooBarOutputFile,
    deBaz: bazOutputFile,
  },
  [
    [ fooBarOutputFile, [[ 'deFoo', fooGenerator() ], [ 'deBar', barGenerator() ]] ],
    [ bazOutputFile, [[ 'deBaz', bazGenerator() ]] ],
  ],
)[0][1]

assert.ok(
  !code.match(/import { deFoo }/),
  'Expected to not find import for refiner in same file',
)

assert.ok(
  code.match(/import { deBaz }/),
  'Expected to find import for refiner in different file',
)
