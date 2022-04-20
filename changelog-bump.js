#!/usr/bin/env node
/**
 * A CLI script for bumping the changelog automatically.
 *
 * It marks the "Upcoming" section as the new version, and creates a new
 * Upcoming section.
 */
const fs = require('fs').promises

const { versionGet } = require('./version.js')

versionGet().then(version => {
  return fs
    .readFile('CHANGELOG.org', 'utf8')
    .then(d => d.replace(
      new RegExp(
        '^\\*\\* (Upcoming)(.+?)\\n\\*\\* 0\\.' + version + '\\.0',
        'sm',
      ),
      `** Upcoming
** 0.${version + 1}.0$2
** 0.${version}.0`,
      // (match, upcoming, old, offset, string, groups) => {

      // }
    ))
})
  .then(d => fs.writeFile('CHANGELOG.org', d, { encoding: 'utf8' }))
  .then(() => console.error('CHANGELOG.org updated!'))
