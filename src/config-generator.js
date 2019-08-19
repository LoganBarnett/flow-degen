// @flow strict

import {
  degenField,
  degenFilePath,
  degenList,
  degenMapping,
  degenObject,
  degenString,
  degenType,
} from './generator.js'

export type ConfigGenerator = {
  exports: {[string]: string},
  inputFile: string,
  outputFile: string,
}

export type Config<CustomType: string, CustomImport: string> = {
  baseDir: string,
  generatedPreamble: string,
  // TODO: Support tuples.
  generators: Array<ConfigGenerator>,
  importLocations: {[CustomImport]: string},
  typeLocations: {[CustomType]: string},
}

const stringType = { name: 'string', typeParams: [] }
const configType = { name: 'Config', typeParams: [ stringType, stringType ]}
const configGeneratorType = { name: 'ConfigGenerator', typeParams: []}

export const degenConfig = () => degenObject<string, string>(configType, [
  degenField('baseDir', degenString()),
  degenField('generatedPreamble', degenString()),
  degenField('typeLocations', degenMapping(degenString(), degenString())),
  degenField('importLocations', degenMapping(degenString(), degenString())),
  degenField('generators', degenList(degenObject(configGeneratorType, [
    degenField('exports', degenMapping(degenString(), degenString())),
    degenField('inputFile', degenString()),
    degenField('outputFile', degenString()),
  ]))),
])
