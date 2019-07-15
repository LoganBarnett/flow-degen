"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _deserializer = require("./deserializer.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _default = function _default(json) {
  if (json === null) {
    return new Error('Could not deserialize json because the value is null.');
  } else if (typeof json == 'undefined') {
    return new Error('Could not deserialize json because the value is undefined.');
  } else if (json instanceof Error || _typeof(json) != 'object') {
    return new Error('Could not deserialize object "' + String(json) + '"');
  } else {
    var baseDir = (0, _deserializer.deField)('baseDir', _deserializer.deString, json.baseDir);

    if (baseDir instanceof Error) {
      var error = baseDir;
      return new Error('Could not deserialize field "baseDir": ' + error.message);
    } else {
      var typeLocations = (0, _deserializer.deField)('typeLocations', _deserializer.deMapping.bind(null, _deserializer.deString, _deserializer.deString), json.typeLocations);

      if (typeLocations instanceof Error) {
        var _error = typeLocations;
        return new Error('Could not deserialize field "typeLocations": ' + _error.message);
      } else {
        var importLocations = (0, _deserializer.deField)('importLocations', _deserializer.deMapping.bind(null, _deserializer.deString, _deserializer.deString), json.importLocations);

        if (importLocations instanceof Error) {
          var _error2 = importLocations;
          return new Error('Could not deserialize field "importLocations": ' + _error2.message);
        } else {
          var generators = (0, _deserializer.deField)('generators', _deserializer.deList.bind(null, _deserializer.deList.bind(null, _deserializer.deString)), json.generators);

          if (generators instanceof Error) {
            var _error3 = generators;
            return new Error('Could not deserialize field "generators": ' + _error3.message);
          } else {
            var result = {
              baseDir: baseDir,
              typeLocations: typeLocations,
              importLocations: importLocations,
              generators: generators
            };
            return result;
          }
        }
      }
    }
  }
};

exports["default"] = _default;