// @flow
import { clone, partial, merge, toPairs, map, append, reduce } from 'ramda'
import fs from 'fs'
import prettier from 'prettier'
import {
  type CodeGenDep,
  type DeImport,
  type DeType,
  type DeserializerGenerator,
} from './generator.js'

const prettierArgs = {
  trailingComma: 'all',
  semi: false,
  singleQuote: true,
}

const importLocations: {[import: DeImport]: string} = {
  deBool: './deserializer.js',
  deField: './deserializer.js',
  deList: './deserializer.js',
  deNumber: './deserializer.js',
  deString: './deserializer.js',
}

const globalTypes = [
  'bool',
  'boolean',
  'function',
  'number',
  'object',
  'string',
]

// Use this to convert types to a series of file paths.
// type StringMap<T: string> = {[key: T]: string}
type KeyedLists = {[key: string]: Array<string>}

const uniqueFromLookup = (
  lookup: {[string]: string},
  excludes: $ReadOnlyArray<string>,
  accumulator: KeyedLists,
  x: string,
): KeyedLists => {
  if(excludes.includes(x)) {
    return accumulator
  }
  else {
    const key = lookup[x]
    const xs = accumulator[key] || []
    if(!xs.includes(x)) {
      return merge(
        accumulator,
        { [key]: append(x, xs) }
      )
    }
    else {
      return accumulator
    }
  }
}

const importExpression = (
  keyword: string,
  imports: $ReadOnlyArray<string>,
  location: string,
): string => {
  return `${keyword} {\n${imports.join(',\n')}\n} from '${location}'`
}

const addJavascriptImports = <T: string>(
  locations: {[string]: string},
  globalsToIgnore: $ReadOnlyArray<string>,
  importKeyword: string,
  imports: $ReadOnlyArray<string>,
): string => {
  const locationsWithImports = reduce(
    partial(uniqueFromLookup, [ locations, globalsToIgnore ]),
    {},
    imports
  )

  const locationImportPairs = toPairs(locationsWithImports)
  return map(
    ([ k, v ]) => importExpression(importKeyword, v, k),
    locationImportPairs
  ).join('\n') + '\n'
}

const stringToFilePromise = (fileName: string, s: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, s, (error) => {
      if(error) {
        reject(error)
      }
      else {
        resolve()
      }
    })
  })
}

// TODO: It will likely be cleaner to use `import { type foo } from 'foo.js'`.
// Then we can have one list of import locations, and a state to indicate
// whether or not they are types.
const header = <CustomType: string, CustomImport: string>(
  typeLocations: {[type: CustomType]: string},
  importLocations: {[type: CustomImport]: string},
  deps: CodeGenDep<CustomType, CustomImport>,
) => {
  return '// @flow\n'
    + addJavascriptImports(
      // Workaround for https://github.com/facebook/flow/issues/5457.
      Object.assign({}, typeLocations),
      globalTypes,
      'import type',
      // deps.types.map(a => a.toString()),
      deps.types,
      // Workaround for https://github.com/facebook/flow/issues/5457.
      // deps.types.map(a => a.toString()),
    )
    + addJavascriptImports(
      // Workaround for https://github.com/facebook/flow/issues/5457.
      Object.assign({}, importLocations),
      [],
      'import',
      // Workaround for https://github.com/facebook/flow/issues/5457.
      deps.imports,
      // deps.imports.map(a => a.toString()),
    ) + '\n'
}

const hoist = (hoists: Array<string>) => {
  return hoists.join('\n\n') + '\n\n'
}

export const codeGen = <CustomType: string, CustomImport: string>(
  typeLocations: {[type: CustomType]: string},
  importLocations: {[type: CustomImport]: string},
  generators: Array<[string, DeserializerGenerator<CustomType, CustomImport>]>,
) => {
  Promise.all(
    generators
      .map(([ file, [ de, deps ] ]) => [ file, de(), deps ])
      .map(([ file, code, deps ]) => {
        const headerCode = header(typeLocations, importLocations, deps)
        const hoistedCode = hoist(deps.hoists)
        return [ file, `${headerCode}\n${hoistedCode}export default ${code}`, deps ]
      })
      .map(([ file, code ]) => {
        return stringToFilePromise(file, prettier.format(code, prettierArgs))
      })
  ).then(() => {
    console.log('done!')
  })
}
