"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _generator = require("./generator.js");

var stringType = {
  name: 'string',
  typeParams: []
};
var configType = {
  name: 'Config',
  typeParams: [stringType, stringType]
};

var _default = function _default() {
  return (0, _generator.degenObject)(configType, [(0, _generator.degenField)('baseDir', (0, _generator.degenString)()), (0, _generator.degenField)('typeLocations', (0, _generator.degenMapping)((0, _generator.degenString)(), (0, _generator.degenString)())), (0, _generator.degenField)('importLocations', (0, _generator.degenMapping)((0, _generator.degenString)(), (0, _generator.degenString)())), (0, _generator.degenField)('generators', (0, _generator.degenList)((0, _generator.degenList)((0, _generator.degenFilePath)())))]);
};

exports.default = _default;