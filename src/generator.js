// @flow strict
import {
  append,
  concat,
  length,
  map,
  merge,
  pipe,
  prop,
  reduce,
  tail,
  times,
} from 'ramda'

import { stringify } from './deserializer.js'

export type DeType =
  | 'Object'
  | 'bool'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'

export type DeImport =
  | 'stringify'
  | 'deBool'
  | 'deField'
  | 'deList'
  | 'deMapping'
  | 'deNumber'
  | 'deString'

export type MetaType<CustomType: string, CustomImport: string> = {
  name: CustomType | DeType,
  typeParams: Array<MetaType<CustomType, CustomImport>>,
}

export type CodeGenDep<CustomType: string, CustomImport: string> = {
  types: Array<MetaType<CustomType, CustomImport>>,
  imports: Array<DeImport | CustomImport>,
  hoists: Array<string>,
}

export type DeserializerGenerator<CustomType: string, CustomImport: string> = [
  () => string,
  CodeGenDep<CustomType, CustomImport>,
]
export type FieldDeserializer<CustomType, CustomImport> = [
  string,
  DeserializerGenerator<CustomType, CustomImport>,
]

type ErrorPred = (e: Error) => Error
export const maybeMap = <T: mixed, U: mixed>(
  unwrap: (T) => U,
  error: ErrorPred,
  x: T | Error
): U | Error => {
  if(x instanceof Error) {
    return error(x)
  }
  else {
    return unwrap(x)
  }
}

export function mergeDeps<CustomType: string, CustomImport: string>(
  a: CodeGenDep<CustomType, CustomImport>,
  b: CodeGenDep<CustomType, CustomImport>,
): CodeGenDep<CustomType, CustomImport> {
  return {
    imports: concat(a.imports, b.imports),
    types: concat(a.types, b.types),
    hoists: concat(a.hoists, b.hoists),
  }
}

export const degenObject = <CustomType: string, CustomImport: string>(
  deType: MetaType<CustomType, CustomImport>,
  requiredFields: Array<FieldDeserializer<CustomType, CustomImport>>,
  optionalFields: Array<FieldDeserializer<CustomType, CustomImport>>,
): DeserializerGenerator<CustomType, CustomImport> => {
  const fieldDeps = reduce(
    mergeDeps,
    { imports: [], types: [], hoists: [] },
    map(([, [, deps]]) => deps, requiredFields)
      .concat(map(([, [, deps]]) => deps, optionalFields)),
  )
  return [() => {
    // Is there an R.unzip?
    // No.
    const requiredFieldNames = map(([n]) => n, requiredFields)
    const requiredFieldRefiners = map(([, f]) => f[0](), requiredFields)
    const optionalFieldRefiners = map(([, f]) => f[0](), optionalFields)
    const typeRefiner = degenType<CustomType, CustomImport>(deType)
    const typeName = typeRefiner[0]()
    return `(json: mixed): ${typeName} | Error => {
  if(json === null) {
    return new Error('Could not deserialize json because the value is null.')
  }
  else if(typeof json == 'undefined') {
    return new Error('Could not deserialize json because the value is undefined.')
  }
  else if(json instanceof Error || typeof json != 'object') {
    return new Error('Could not deserialize object "' + String(json) + '"')
  }
  else {
    ${requiredFields.map(([name, refiner]) => {
// The { is matched towards the end of the generator.
return `const ${name} = ${refiner[0]()}
if(${name} instanceof Error) {
  return ${name}
} else {
`
    }).join('\n')}
      const result = {}
        ${requiredFieldNames.map(f => `result.${f} = ${f}`).join('\n')}
      ${optionalFields.map(([name, refiner]) => {
        return `\
if(json.hasOwnProperty('${name}')) {
  const ${name} = ${refiner[0]()}
  if(${name} instanceof Error) {
    return ${name}
  } else {
    result.${name} = ${name}
  }
}`
      }).join('\n')}
      return result
    ${times(() => '}', length(requiredFieldRefiners)).join('')}
  }
}
`
  },
    mergeDeps(fieldDeps, { types: [deType], imports: [], hoists: [] })
  ]
}

export const degenField = <CustomType: string, CustomImport: string>(
  fieldName: string,
  deserializer: DeserializerGenerator<CustomType, CustomImport>,
): FieldDeserializer<CustomType, CustomImport> => {
  const [deserializerFn, deps] = deserializer
  return [fieldName, [() => {
    // the `else {` is terminated in deObject during the join.
    return `deField('${fieldName}',
        (${deserializerFn()}),
        json.${fieldName})`
  },
    mergeDeps(deps, { types: [], imports: ['deField'], hoists: [] }),
  ]]
}

export const degenList = <CustomType: string, CustomImport: string>(
  metaType: MetaType<CustomType, CustomImport>,
  element: DeserializerGenerator<CustomType, CustomImport>,
): DeserializerGenerator<CustomType, CustomImport> => {
  const [elementDeserializer, deps] = element
  return [() => {
    return `(
deList.bind(null, ${elementDeserializer()}):
(mixed) => Array<${typeHeader(metaType)}> | Error
)`
  }, mergeDeps<CustomType, CustomImport>(
    deps,
    { types: [metaType], imports: ['deList'], hoists: [] },
  ),
  ]
}

export const degenMapping = <CustomType: string, CustomImport: string>(
  keyMetaType: MetaType<CustomType, CustomImport>,
  valueMetaType: MetaType<CustomType, CustomImport>,
  keyGenerator: DeserializerGenerator<CustomType, CustomImport>,
  valueGenerator: DeserializerGenerator<CustomType, CustomImport>,
): DeserializerGenerator<CustomType, CustomImport> => {
  const [keyDeserializer, keyDeps] = keyGenerator
  const [valueDeserializer, valueDeps] = valueGenerator
  const deps = {
    types: [keyMetaType, valueMetaType],
    imports: ['deMapping'],
    hoists: [],
  }
  return [
    () => `(
deMapping.bind(null, ${keyDeserializer()}, ${valueDeserializer()}):
(mixed) => { [${typeHeader(keyMetaType)}]: ${typeHeader(valueMetaType)} } | Error
)`,
    mergeDeps<CustomType, CustomImport>(mergeDeps(keyDeps, valueDeps), deps),
  ]
}

export const degenString = <CustomType: string, CustomImport: string>(
): DeserializerGenerator<CustomType, CustomImport> => {
  return [() => {
    return `deString`
  }, {
    types: [ { name: 'string', typeParams: [] } ],
    imports: ['deString'],
    hoists: [],
  }]
}

// Right now I don't know how we'd verify what a file path looks like other than
// checking to see if there's an extension (which needn't always be the case).
// For now this gives us semantic expressions at least.
export const degenFilePath = degenString

export const degenEnum = <CustomType: string, CustomImport: string>(
  deType: MetaType<CustomType, CustomImport>,
  values: Array<string>
): DeserializerGenerator<CustomType, CustomImport> => {
  const [ stringGen, deps ] = degenString()
  return [() => {
    // Needs triple equals here.
    const check = values.map(x => `'${x}'`).join(' === either || ') + ' === either'
    const oneOf = values.join(', ')
    const typeName = degenType<CustomType, CustomImport>(deType)[0]()
    return `(v: mixed): ${typeName} | Error => {
  const either = ${stringGen()}(v)
  if(either instanceof Error) {
    return new Error('Could not deserialize "' + String(v) +'" into enum "${typeName}":' + either.message)
  }
  else {
    if(${check}) {
      return either
    }
    else {
      return new Error('Could not deserialize "' + String(v) +"' into one of the enum values: ${oneOf}'")
    }
  }
}`
  },
    mergeDeps<CustomType, CustomImport>(
      deps,
      { types: [ deType ], imports: [], hoists: [] },
    )
  ]
}

export const degenBool = <CustomType: string, CustomImport: string>(
): DeserializerGenerator<CustomType, CustomImport> => {
  return [() => {
    return `deBool`
  }, {
    types: [],
    imports: ['deBool'],
    hoists: [],
  }]
}

export const degenNumber = <CustomType: string, CustomImport: string>(
): DeserializerGenerator<CustomType, CustomImport> => {
  return [() => {
    return `deNumber`
  }, {
    types: [],
    imports: ['deNumber'],
    hoists: [],
  }]
}

export type DeSentinelProp<CustomType: string, CustomImport: string> = {
  key: string,
  deserializer: DeserializerGenerator<CustomType, CustomImport>,
}

export const degenSentinelValue = <CustomType: string, CustomImport: string>(
  key: string,
  deserializer: DeserializerGenerator<CustomType, CustomImport>,
): DeSentinelProp<CustomType, CustomImport> => {
  return { key, deserializer }
}

const sentinelPropToCase = <CustomType: string, CustomImport: string>(
  x: DeSentinelProp<CustomType, CustomImport>,
): string => {
  return `case '${x.key}':
  return (${x.deserializer[0]()})(x)
`
}

const addReturnToCase = (kase: string): string => {
  return `${kase}
return x`
}

export const degenSum = <CustomType: string, CustomImport: string>(
  deType: MetaType<CustomType, CustomImport>,
  sentinelField: string,
  sentinelFieldType: MetaType<CustomType, CustomImport>,
  props: Array<DeSentinelProp<CustomType, CustomImport>>,
): DeserializerGenerator<CustomType, CustomImport> => {
  const fnName = `${deType.name}Refine`
  const typeHeader = degenType<CustomType, CustomImport>(deType)[0]()
  // Type declaration needs to be outside the function or we get "name already
  // bound"
  const enumGen = degenEnum<CustomType, CustomImport>(
    sentinelFieldType,
    props.map(p => p.key),
  )
  const hoist = `
// Exhaustive union checks don't work, but there is a workaround.
// See: https://github.com/facebook/flow/issues/3790
type ${deType.name}UnreachableFix = {| '@@flow-degen/unreachable-fix': 'false-field' |}
type ${deType.name}ExhaustiveUnionFix = ${sentinelFieldType.name} | ${deType.name}UnreachableFix
const ${fnName} = (x: mixed): ${typeHeader} | Error => {
  if(x != null && typeof x == 'object' && x.hasOwnProperty('${sentinelField}')
&& typeof x.${sentinelField} == 'string') {
    const sentinelValue = (${enumGen[0]()})(x.${sentinelField})
    if(sentinelValue instanceof Error) {
      return new Error('Sentinel field ${sentinelField} could not deserialize properly: ' + sentinelValue.message)
    }
    else {
      const union: ${deType.name}ExhaustiveUnionFix = sentinelValue
      switch(union) {
        ${pipe(
          map(sentinelPropToCase),
        )(props).join('\n')}
      default:
        // Fixes Flow's inability to cover exhaustive cases.
        ;(union: ${deType.name}UnreachableFix)
        return new Error('unreachable')
      }
    }
  }
  else {
    return new Error('Could not deserialize object into ${deType.name}: ' + stringify(x))
  }
}`
  return [() => {return `${fnName}`}, reduce(mergeDeps, {
    types: [deType, sentinelFieldType],
    imports: ['stringify'],
    hoists: [hoist],
  }, append(enumGen[1], map(
    (y: DeserializerGenerator<CustomType, CustomImport>) => y[1],
    map(prop('deserializer'), props),
  )))]
}

export const typeHeader = <CustomType: string, CustomImport: string>(
  type: MetaType<CustomType, CustomImport>,
): string => {
  if(type.typeParams.length > 0) {
    const params = type.typeParams.map(typeHeader)
    return `${type.name}<${params.join(', ')}>`
  }
  else {
    // Kind of a weird case to support.
    return type.name
  }
}

export const flattenTypes = <CustomType: string, CustomImport: string>(
  type: MetaType<CustomType, CustomImport>,
): Array<MetaType<CustomType, CustomImport>> => {
  const nestedTypes = type.typeParams.map(flattenTypes)
  return reduce<
    Array<MetaType<CustomType, CustomImport>>,
    Array<MetaType<CustomType, CustomImport>>,
  >(concat, [ type ], nestedTypes)
}

export const degenType = <CustomType: string, CustomImport: string>(
  type: MetaType<CustomType, CustomImport>,
): DeserializerGenerator<CustomType, CustomImport> => {
  return [() => typeHeader(type), {
    types: [],
    imports: [],
    hoists: [],
  }]
}

export const degenValue = <CustomType: string, CustomImport: string>(
  type: string,
  value: mixed,
): DeserializerGenerator<CustomType, CustomImport> => {
  return [() => {
    return `(x: mixed) => {
  if(typeof x != '${type}') {
    return new Error('Could not deserialize "' + String(x) + '" into a ${type}.')
  }
  else if(x === ${stringify(value)}){
    return x
  }
  else {
    return new Error('Could not deserialize "' + String(x) + '" into a ${type} with the value ${stringify(value)}.')
  }
}`}, {
  types: [],
  imports: ['stringify'],
  hoists: [],
}]
}

export const de = <CustomType: string, CustomImport: string>(
  type: string,
  deserializer: DeserializerGenerator<CustomType, CustomImport>,
): string => {
  return `genHook.genDe${type} = ${deserializer[0]()}`
}

export const degenRefiner = <CustomType: string, CustomImport: string>(
  refinerType: MetaType<CustomType, CustomImport>,
  refinerSymbol: CustomImport,
): DeserializerGenerator<CustomType, CustomImport> => {
  return [
    () => refinerSymbol,
    { types: [refinerType], imports: [refinerSymbol], hoists: [] },
  ]
}

export const degenMaybe = <CustomType: string, CustomImport: string>(
  refinerType: MetaType<CustomType, CustomImport>,
  refiner: DeserializerGenerator<CustomType, CustomImport>,
): DeserializerGenerator<CustomType, CustomImport> => {
  const [code, dependencies] = refiner

  return [
    () => {
      return `
        (x: mixed): ?${typeHeader(refinerType)} | Error => {
          if (x != null) {
            const refiner = ${code()}

            return refiner(x)
          } else {
            return null
          }
        }
      `
    },
    mergeDeps<CustomType, CustomImport>(
      dependencies,
      { types: [ refinerType ], imports: [], hoists: [] },
    ),
  ]
}
