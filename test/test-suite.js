// @flow strict
import { exec } from 'child_process'

const runTest = (testFile: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = exec(`yarn babel-node test/${testFile}`, {}, (error, stdout, sterr) => {
      if (error) {
        console.error('Error running test', testFile, stdout.toString())
        reject(new Error('test exit code: ' + String(error.code)))
      } else {
        resolve()
      }
    })
  })
}

Promise.all([
  runTest('base-path.js'),
  runTest('exhaustive-union.js'),
  runTest('flow-strict.js'),
  runTest('imports.js'),
  runTest('maybe.js'),
  runTest('preamble.js'),
]).then(() => {
  console.log('All tests passed!')
  process.exit(0)
}).catch(() => {
  console.error('There were failing tests! Check the console output for details.')
  process.exit(1)
})
