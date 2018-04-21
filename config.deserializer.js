// @flow
import type { Config } from './config-generator.js'
import { deString, deMapping, deField, deList } from 'undefined'

export default (json: mixed): Config | Error => {
  if (json === null) {
    return new Error('Could not deserialize json because the value is null.')
  } else if (typeof json == 'undefined') {
    return new Error(
      'Could not deserialize json because the value is undefined.',
    )
  } else if (json instanceof Error || typeof json != 'object') {
    return new Error('Could not deserialize object "' + String(json) + '"')
  } else {
    const typeLocations = deField(
      'typeLocations',
      deMapping.bind(null, deString, deString),
      json.typeLocations,
    )
    if (typeLocations instanceof Error) {
      const error: Error = typeLocations
      return new Error(
        'Could not deserialize field "typeLocations": ' + error.message,
      )
    } else {
      const importLocations = deField(
        'importLocations',
        deMapping.bind(null, deString, deString),
        json.importLocations,
      )
      if (importLocations instanceof Error) {
        const error: Error = importLocations
        return new Error(
          'Could not deserialize field "importLocations": ' + error.message,
        )
      } else {
        const generators = deField(
          'generators',
          deList.bind(null, deString),
          json.generators,
        )
        if (generators instanceof Error) {
          const error: Error = generators
          return new Error(
            'Could not deserialize field "generators": ' + error.message,
          )
        } else {
          const result: Config = {
            typeLocations,
            importLocations,
            generators,
          }
          return result
        }
      }
    }
  }
}
