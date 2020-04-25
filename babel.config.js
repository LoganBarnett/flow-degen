// @flow strict
/*::
import { type Options } from '@babel/register'
*/
module.exports = ({
  plugins: [ '@babel/plugin-transform-modules-commonjs' ],
  presets: [ '@babel/preset-flow' ],
}/*: Options */)
