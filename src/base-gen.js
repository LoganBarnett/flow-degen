// @flow
import {
  append,
  clone,
  concat,
  map,
  merge,
  partial,
  prop,
  reduce,
  toPairs,
} from 'ramda'
import fs from 'fs'
import prettier from 'prettier'
import path from 'path'
import {
  type CodeGenDep,
  type DeImport,
  type DeType,
  type DeserializerGenerator,
  degenType,
  flattenTypes,
  mergeDeps,
} from './generator.js'

const prettierArgs = {
  trailingComma: 'all',
  semi: false,
  singleQuote: true,
}

const baseImportLocations: {[import: DeImport]: string} = {
  deBool: 'flow-degen',
  deField: 'flow-degen',
  deList: 'flow-degen',
  deNumber: 'flow-degen',
  deString: 'flow-degen',
  stringify: 'flow-degen',
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

const stringToFilePromise = (fileName: string, s: string): Promise<void> => {
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
  file: string,
  baseDir: string,
  preamble: string,
  typeLocations: {[type: CustomType]: string},
  importLocations: {[type: CustomImport]: string},
  deps: CodeGenDep<CustomType, CustomImport>,
): string => {
  const trimBase = (base: string, s: string): string => {
    const i = s.indexOf(base)
    return i > -1 ? s.substring(i) : s
  }
  const trimBaseDir = trimBase.bind(null, baseDir)

  return preamble
    + '\n// @flow strict\n'
    + addJavascriptImports(
      // Workaround for https://github.com/facebook/flow/issues/5457.
      merge({}, typeLocations),
      globalTypes,
      'import type',
      reduce(
        concat,
        [],
        deps.types.map(flattenTypes)).map(prop('name')),
    )
    + addJavascriptImports(
      // Workaround for https://github.com/facebook/flow/issues/5457.
      merge({}, importLocations),
      Object.keys(importLocations).filter(i => importLocations[i] == file),
      'import',
      // Workaround for https://github.com/facebook/flow/issues/5457.
      deps.imports,
    ) + '\n'
}

const hoist = (hoists: Array<string>): string => {
  return hoists.join('\n\n') + '\n\n'
}

export const codeGen = <CustomType: string, CustomImport: string>(
  baseDir: string,
  preamble: string,
  typeLocations: {[type: CustomType]: string},
  customImportLocations: {[type: CustomImport]: string},
  generators: Array<[string, Array<[ string, DeserializerGenerator<CustomType, CustomImport>]>]>,
): Array<[ string, string, CodeGenDep<CustomType, CustomImport> ]> => {
  const importLocations = merge(baseImportLocations, customImportLocations)
  return generators
    .map(([ file, degens ]) => {
      const codeAndDeps
        : Array<[string, CodeGenDep<CustomType, CustomImport>]>
        = degens.map(([name, degen ]) => {
          const [ fn, deps ] = degen
          return [`export const ${name} = ` + fn(), deps]
        })
      const code = codeAndDeps.map(([code, ]) => code).join('\n')
      const deps = codeAndDeps.map(([, deps]) => deps).reduce(mergeDeps, {
        hoists: [],
        imports: [],
        types: [],
      })

      const headerCode = header(
        file,
        baseDir,
        preamble,
        typeLocations,
        importLocations,
        deps,
      )
      const hoistedCode = hoist(deps.hoists)
      const finalCode = `${headerCode}\n${hoistedCode}\n${code}`
      // console.error(finalCode)
      return [
        path.join(baseDir, file),
        prettier.format(finalCode, prettierArgs),
        deps,
      ]
    })
}

export const fileGen = <CustomType: string, CustomImport: string>(
  baseDir: string,
  preamble: string,
  typeLocations: {[type: CustomType]: string},
  customImportLocations: {[type: CustomImport]: string},
  generators: Array<[string, Array<[ string, DeserializerGenerator<CustomType, CustomImport>]>]>,
) => {
  return Promise.all(
    codeGen(baseDir, preamble, typeLocations, customImportLocations, generators)
      .map(([ file, code ]) => stringToFilePromise(file, code))
  )
  .then(() => {
    console.log('done!')
  })
}
