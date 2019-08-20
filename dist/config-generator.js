"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.degenConfig = void 0;

var _generator = require("./generator.js");

var stringType = {
  name: 'string',
  typeParams: []
};
var configType = {
  name: 'Config',
  typeParams: [stringType, stringType]
};
var configGeneratorType = {
  name: 'ConfigGenerator',
  typeParams: []
};

var degenConfig = function degenConfig() {
  return (0, _generator.degenObject)(configType, [(0, _generator.degenField)('baseDir', (0, _generator.degenFilePath)()), (0, _generator.degenField)('generatedPreamble', (0, _generator.degenString)()), (0, _generator.degenField)('typeLocations', (0, _generator.degenMapping)((0, _generator.degenString)(), (0, _generator.degenFilePath)())), (0, _generator.degenField)('importLocations', (0, _generator.degenMapping)((0, _generator.degenString)(), (0, _generator.degenFilePath)())), (0, _generator.degenField)('generators', (0, _generator.degenList)((0, _generator.degenObject)(configGeneratorType, [(0, _generator.degenField)('exports', (0, _generator.degenMapping)((0, _generator.degenString)(), (0, _generator.degenString)())), (0, _generator.degenField)('inputFile', (0, _generator.degenFilePath)()), (0, _generator.degenField)('outputFile', (0, _generator.degenFilePath)())])))]);
};

exports.degenConfig = degenConfig;