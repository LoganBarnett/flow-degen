// @flow strict
import {
  mergeDeps,
  type DeserializerGenerator,
  type MetaType,
  typeHeader,
} from '../src/generator.js'

type MyImport =
  | 'importedFn'
  | 'otherIdentifier'

const customDegen = <CustomType: string>(
  refinerType: MetaType<CustomType, MyImport>,
  refinerGenerator: DeserializerGenerator<CustomType, MyImport>,
) => {
  const [refinerCode, deps] = refinerGenerator
  const header = typeHeader(refinerType)

  return [
    () => {
      return `
        (x: mixed): ${header} | Error => {
          const refiner = ${refinerCode()}
          return refiner(${refinerCode()}())
        }
      `
    },
    mergeDeps<CustomType, MyImport>(
      deps,
      { types: [], imports: [ 'importedFn' ], hoists: [] },
    ),
  ]
}
