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
    const process = exec(`yarn babel-node test/${testFile}`, {}, (error, stdout, sterr) => {
      console.log(`Running test ${testFile}`)
      if (error) {
        console.error('Error running test', testFile, stdout.toString())
        reject(new Error('test exit code: ' + String(error.code)))
      } else {
        resolve()
      }
    })
  })
}

// Add new test files to this list
const tests = [
  'base-path.js',
  'custom-import.js',
  'exhaustive-union.js',
  'flow-strict.js',
  'imports.js',
  'maybe.js',
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

Promise.all(testPromises(selectedTests)).then(() => {
  console.log('All tests passed!')
  process.exit(0)
}).catch(() => {
  console.error('There were failing tests! Check the console output for details.')
  process.exit(1)
})
