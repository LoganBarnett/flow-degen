// @flow strict
import type { ConfigGenerator, Config } from './config-generator.js'
import { deString, deField, deMapping, deList } from './deserializer.js'

export const deConfig = (json: mixed): Config<string, string> | Error => {
  if (json === null) {
    return new Error('Could not deserialize json because the value is null.')
  } else if (typeof json == 'undefined') {
    return new Error(
      'Could not deserialize json because the value is undefined.',
    )
  } else if (json instanceof Error || typeof json != 'object') {
    return new Error('Could not deserialize object "' + String(json) + '"')
  } else {
    const baseDir = deField('baseDir', deString, json.baseDir)
    if (baseDir instanceof Error) {
      const error: Error = baseDir
      return new Error(
        'Could not deserialize field "baseDir": ' + error.message,
      )
    } else {
      const generatedPreamble = deField(
        'generatedPreamble',
        deString,
        json.generatedPreamble,
      )
      if (generatedPreamble instanceof Error) {
        const error: Error = generatedPreamble
        return new Error(
          'Could not deserialize field "generatedPreamble": ' + error.message,
        )
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
              deList.bind(null, (json: mixed): ConfigGenerator | Error => {
                if (json === null) {
                  return new Error(
                    'Could not deserialize json because the value is null.',
                  )
                } else if (typeof json == 'undefined') {
                  return new Error(
                    'Could not deserialize json because the value is undefined.',
                  )
                } else if (json instanceof Error || typeof json != 'object') {
                  return new Error(
                    'Could not deserialize object "' + String(json) + '"',
                  )
                } else {
                  const exports = deField(
                    'exports',
                    deMapping.bind(null, deString, deString),
                    json.exports,
                  )
                  if (exports instanceof Error) {
                    const error: Error = exports
                    return new Error(
                      'Could not deserialize field "exports": ' + error.message,
                    )
                  } else {
                    const inputFile = deField(
                      'inputFile',
                      deString,
                      json.inputFile,
                    )
                    if (inputFile instanceof Error) {
                      const error: Error = inputFile
                      return new Error(
                        'Could not deserialize field "inputFile": ' +
                          error.message,
                      )
                    } else {
                      const outputFile = deField(
                        'outputFile',
                        deString,
                        json.outputFile,
                      )
                      if (outputFile instanceof Error) {
                        const error: Error = outputFile
                        return new Error(
                          'Could not deserialize field "outputFile": ' +
                            error.message,
                        )
                      } else {
                        const result: ConfigGenerator = {
                          exports,
                          inputFile,
                          outputFile,
                        }
                        return result
                      }
                    }
                  }
                }
              }),
              json.generators,
            )
            if (generators instanceof Error) {
              const error: Error = generators
              return new Error(
                'Could not deserialize field "generators": ' + error.message,
              )
            } else {
              const result: Config<string, string> = {
                baseDir,
                generatedPreamble,
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
  }
}
