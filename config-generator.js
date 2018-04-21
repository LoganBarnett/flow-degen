// @flow

import {
  degenField,
  degenFilePath,
  degenList,
  degenMapping,
  degenObject,
  degenString,
} from './generator.js'

export type Config<CustomType: string, CustomImport: string> = {
  importLocations: {[CustomImport]: string},
  typeLocations: {[CustomType]: string},
  generators: {[string]: string},
}

export default () => degenObject('Config', [
  degenField('typeLocations', degenMapping(degenString(), degenString())),
  degenField('importLocations', degenMapping(degenString(), degenString())),
  degenField('generators', degenList(degenFilePath())),
])
