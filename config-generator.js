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

// const customType = degenType('CustomType', { constraint: 'string' })
// const customImport = degenType('CustomImport', { constraint: 'string' })
// degenType('Config', {
//   typeParams: [
//     customType,
//     customImport,
//   ],
// })

export default () => degenObject('Config', [
  degenField('typeLocations', degenMapping(degenString(), degenString())),
  degenField('importLocations', degenMapping(degenString(), degenString())),
  degenField('generators', degenList(degenList(degenFilePath()))),
])
