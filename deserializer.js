// @flow

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
    const list = value.map(elementDeserializer)
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

export const deString = (x: mixed): string | Error => {
  if(typeof x != 'string') {
    return new Error('Could not deserialize "' + String(x) + '" into a string.')
  }
  else {
    return x
  }
}
