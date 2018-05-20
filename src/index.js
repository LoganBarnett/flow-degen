// @flow

export {
  deBool,
  deField,
  deList,
  deMapping,
  deNumber,
  deString,
} from './deserializer.js'
// export {
//   codeGen,
// } from './base-gen.js'
export {
  degenBool,
  degenEnum,
  degenField,
  degenFilePath,
  degenList,
  degenNumber,
  degenObject,
  degenSentinelValue,
  degenString,
  degenSum,
  degenType,
  degenValue,
  mergeDeps,
} from './generator.js'
export type {
  CodeGenDep,
  DeImport,
  DeType,
  DeserializerGenerator,
  MetaType,
} from './generator.js'
