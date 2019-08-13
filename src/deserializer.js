// @flow

/**
 * JSON.stringify could returned undefined if the input itself is undefined,
 * which is a possible value from mixed. For the purposes of giving us a string,
 * we don't really care and can assume the string 'undefined' in that case.
 */
export const stringify = (x: mixed): string => {
  const s = JSON.stringify(x)
  return s === undefined ? 'undefined' : s
}


export const deBool = (x: mixed): bool | Error => {
  if(typeof x != 'boolean') {
    return new Error('Could not deserialize "' + String(x) + '" into a bool.')
  }
  else {
    return x
  }
}

export const deNumber = (x: mixed): number | Error => {
  if(typeof x != 'number') {
    return new Error('Could not deserialize "' + String(x) + '" into a number.')
  }
  else {
    return x
  }
}

export const deField = <T>(
  name: string,
  deserializer: (a: mixed) => (T | Error),
  x: mixed,
): T | Error => {
  const deserialized = deserializer(x)
  if(deserialized instanceof Error) {
    return new Error(`Could not deserialize field ${name}: ${deserialized.message}`)
  }
  else {
    return deserialized
  }
}

export const deList = <E>(
  elementDeserializer: mixed => (E | Error),
  value: mixed,
): Array<E> | Error => {
  if (Array.isArray(value)) {
    // "any" gets added to the E | Error here in the Array. It is not understood
    // why this is.
    const list: Array<E | Error> = value.map(elementDeserializer)
    // Flow doesn't support type refinement with Array.filter. See:
    // https://github.com/facebook/flow/issues/1414
    // const errors = results.filter(r => r instanceof Error)
    const errors: Array<Error> = list.reduce((xs, x) => {
      if(x instanceof Error) {
        return xs.concat([x])
      } else {
        return xs
      }
    }, ([]: Array<Error>))
    if(errors.length > 0) {
      return new Error(
        'Could not deserialize list due to errors in the elements: ' +
          errors.map(e => e.message).join('\\n')
      )
    }
    else {
      // Flow doesn't support type refinement with Array.filter. See:
      // https://github.com/facebook/flow/issues/1414
      return list.reduce(
        (xs: Array<E>, x) => x instanceof Error ? xs : xs.concat([x]),
        [],
      )
    }
  }
  else {
    return new Error('Could not deserialize "' + String(value) + '" into an Array')
  }
}

export const deMapping = <K, V>(
  keyDeserializer: mixed => (K | Error),
  valueDeserializer: mixed => (V | Error),
  x: mixed,
): {[K]: V} | Error => {
  if(x == null || typeof x != 'object') {
    return new Error('Could not deserialize ' + String(x) + ' into an object.')
  } else {
    const keys = deList(keyDeserializer, Object.keys(x))
    if(keys instanceof Error) {
      return new Error('Could not deserialize keys: ' + keys.message)
    } else {
      const values = deList(valueDeserializer, Object.values(x))
      if(values instanceof Error) {
        return new Error('Could not deserialize values: ' + values.message)
      } else {
        const result: {[K]: V} = {}
        for(let i = 0; i < keys.length; ++i) {
          result[keys[i]] = values[i]
        }
        return result
      }
    }
  }
}

export const deString = (x: mixed): string | Error => {
  if(typeof x != 'string') {
    return new Error('Could not deserialize "' + String(x) + '" into a string.')
  }
  else {
    return x
  }
}
