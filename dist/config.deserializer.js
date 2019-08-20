"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deConfig = void 0;

var _deserializer = require("./deserializer.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var deConfig = function deConfig(json) {
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
      var generatedPreamble = (0, _deserializer.deField)('generatedPreamble', _deserializer.deString, json.generatedPreamble);

      if (generatedPreamble instanceof Error) {
        var _error = generatedPreamble;
        return new Error('Could not deserialize field "generatedPreamble": ' + _error.message);
      } else {
        var typeLocations = (0, _deserializer.deField)('typeLocations', _deserializer.deMapping.bind(null, _deserializer.deString, _deserializer.deString), json.typeLocations);

        if (typeLocations instanceof Error) {
          var _error2 = typeLocations;
          return new Error('Could not deserialize field "typeLocations": ' + _error2.message);
        } else {
          var importLocations = (0, _deserializer.deField)('importLocations', _deserializer.deMapping.bind(null, _deserializer.deString, _deserializer.deString), json.importLocations);

          if (importLocations instanceof Error) {
            var _error3 = importLocations;
            return new Error('Could not deserialize field "importLocations": ' + _error3.message);
          } else {
            var generators = (0, _deserializer.deField)('generators', _deserializer.deList.bind(null, function (json) {
              if (json === null) {
                return new Error('Could not deserialize json because the value is null.');
              } else if (typeof json == 'undefined') {
                return new Error('Could not deserialize json because the value is undefined.');
              } else if (json instanceof Error || _typeof(json) != 'object') {
                return new Error('Could not deserialize object "' + String(json) + '"');
              } else {
                var exports = (0, _deserializer.deField)('exports', _deserializer.deMapping.bind(null, _deserializer.deString, _deserializer.deString), json.exports);

                if (exports instanceof Error) {
                  var _error4 = exports;
                  return new Error('Could not deserialize field "exports": ' + _error4.message);
                } else {
                  var inputFile = (0, _deserializer.deField)('inputFile', _deserializer.deString, json.inputFile);

                  if (inputFile instanceof Error) {
                    var _error5 = inputFile;
                    return new Error('Could not deserialize field "inputFile": ' + _error5.message);
                  } else {
                    var outputFile = (0, _deserializer.deField)('outputFile', _deserializer.deString, json.outputFile);

                    if (outputFile instanceof Error) {
                      var _error6 = outputFile;
                      return new Error('Could not deserialize field "outputFile": ' + _error6.message);
                    } else {
                      var result = {
                        exports: exports,
                        inputFile: inputFile,
                        outputFile: outputFile
                      };
                      return result;
                    }
                  }
                }
              }
            }), json.generators);

            if (generators instanceof Error) {
              var _error7 = generators;
              return new Error('Could not deserialize field "generators": ' + _error7.message);
            } else {
              var result = {
                baseDir: baseDir,
                generatedPreamble: generatedPreamble,
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
  }
};

exports.deConfig = deConfig;