// @flow

import {
  degenField,
  degenFilePath,
  degenList,
  degenMapping,
  degenObject,
  degenString,
  degenType,
} from './generator.js'

export type Config<CustomType: string, CustomImport: string> = {
  importLocations: {[CustomImport]: string},
  typeLocations: {[CustomType]: string},
  // TODO: Support tuples.
  generators: Array<Array<string>>,
}

const stringType = { name: 'string', typeParams: [] }
const configType = { name: 'Config', typeParams: [ stringType, stringType ]}

export default () => degenObject(configType, [
  degenField('typeLocations', degenMapping(degenString(), degenString())),
  degenField('importLocations', degenMapping(degenString(), degenString())),
  degenField('generators', degenList(degenList(degenFilePath()))),
])
