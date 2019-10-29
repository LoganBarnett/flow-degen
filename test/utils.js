// @flow strict

import { exec } from 'child_process'

const streamToPromise = (s: stream$Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks = []
    s.on('data', (c: string) => chunks.push(c))
    s.on('end', () => resolve(chunks.join('')))
    s.on('error', (e: mixed) => reject(e))
  })
}

export const runFlow = (code: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const process = exec(`yarn flow check-contents`, {}, (error, stdout, sterr) => {
      if(error) {
        console.error('Error running "yarn flow check-contents":', error, stdout.toString())
      } else {
        // console.log('is this the entire output?', stdout.toString())
      }
    })

    process.stdin.write(code)
    process.stdin.end()

    resolve(streamToPromise(process.stdout))
  })
}
