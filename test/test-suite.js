// @flow strict
import { exec } from 'child_process'
import {
  always,
  identity,
  ifElse,
  intersection,
  isEmpty,
  map,
  pipe,
} from 'ramda'

const runTest = (testFile: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`Running test ${testFile}`)
    const process = exec(
      `yarn babel-node test/${testFile}`,
      {},
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            'Error running test',
            testFile,
            stdout.toString(),
            stderr.toString(),
          )
          reject(new Error('test exit code: ' + String(error.code)))
        } else {
          // Ideally we aren't depending on log output, but sometimes it's
          // useful to debug even passing tests.
          console.log(stdout.toString())
          resolve()
        }
      })
  })
}

// Add new test files to this list
const tests = [
  'base-path.js',
  'call-site-type-delist.js',
  'call-site-type-demapping.js',
  'call-site-type-opaque.js',
  'custom-gen-with-import.js',
  'exhaustive-union.js',
  'flow-strict.js',
  'flow-utility-types.js',
  'imports.js',
  'mapping.js',
  'maybe.js',
  'object-optional-fields.js',
  'preamble.js',
]

const selectedTests = process.argv.slice(2)

const testPromises = pipe(
  ifElse(
    isEmpty,
    always(tests),
    identity,
  ),
  intersection(tests),
  map(runTest),
)

const testRuns = testPromises(selectedTests)
Promise.all(testRuns).then(() => {
  const size = testRuns.length
  console.log(`All tests passed! ${size}/${size}`)
  process.exit(0)
}).catch((error: mixed) => {
  console.error(
    'There were failing tests! Check the console output for details.',
    error,
  )
  process.exit(1)
})
