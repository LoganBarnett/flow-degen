"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fileGen = exports.codeGen = void 0;

var _ramda = require("ramda");

var _fs = _interopRequireDefault(require("fs"));

var _prettier = _interopRequireDefault(require("prettier"));

var _generator = require("./generator.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var prettierArgs = {
  trailingComma: 'all',
  semi: false,
  singleQuote: true
};
var baseImportLocations = {
  deBool: 'flow-degen',
  deField: 'flow-degen',
  deList: 'flow-degen',
  deNumber: 'flow-degen',
  deString: 'flow-degen',
  stringify: 'flow-degen'
};
var globalTypes = ['bool', 'boolean', 'function', 'number', 'object', 'string']; // Use this to convert types to a series of file paths.
// type StringMap<T: string> = {[key: T]: string}

var uniqueFromLookup = function uniqueFromLookup(lookup, excludes, accumulator, x) {
  if (excludes.includes(x)) {
    return accumulator;
  } else {
    var _key = lookup[x];
    var xs = accumulator[_key] || [];

    if (!xs.includes(x)) {
      return (0, _ramda.merge)(accumulator, _defineProperty({}, _key, (0, _ramda.append)(x, xs)));
    } else {
      return accumulator;
    }
  }
};

var importExpression = function importExpression(keyword, imports, location) {
  return "".concat(keyword, " {\n").concat(imports.join(',\n'), "\n} from '").concat(location, "'");
};

var addJavascriptImports = function addJavascriptImports(locations, globalsToIgnore, importKeyword, imports) {
  var locationsWithImports = (0, _ramda.reduce)((0, _ramda.partial)(uniqueFromLookup, [locations, globalsToIgnore]), {}, imports);
  var locationImportPairs = (0, _ramda.toPairs)(locationsWithImports);
  return (0, _ramda.map)(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];

    return importExpression(importKeyword, v, k);
  }, locationImportPairs).join('\n') + '\n';
};

var stringToFilePromise = function stringToFilePromise(fileName, s) {
  return new Promise(function (resolve, reject) {
    _fs["default"].writeFile(fileName, s, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}; // TODO: It will likely be cleaner to use `import { type foo } from 'foo.js'`.
// Then we can have one list of import locations, and a state to indicate
// whether or not they are types.


var header = function header(baseDir, typeLocations, importLocations, deps) {
  var trimBase = function trimBase(base, s) {
    var i = s.indexOf(base);
    return i > -1 ? s.substring(i) : s;
  };

  var trimBaseDir = trimBase.bind(null, baseDir);
  return '// @flow\n' + addJavascriptImports( // Workaround for https://github.com/facebook/flow/issues/5457.
  (0, _ramda.merge)({}, typeLocations), globalTypes, 'import type', (0, _ramda.reduce)(_ramda.concat, [], deps.types.map(_generator.flattenTypes)).map((0, _ramda.prop)('name')).map(trimBaseDir)) + addJavascriptImports( // Workaround for https://github.com/facebook/flow/issues/5457.
  (0, _ramda.merge)({}, importLocations), [], 'import', // Workaround for https://github.com/facebook/flow/issues/5457.
  deps.imports.map(trimBaseDir)) + '\n';
};

var hoist = function hoist(hoists) {
  return hoists.join('\n\n') + '\n\n';
};

var codeGen = function codeGen(baseDir, typeLocations, customImportLocations, generators) {
  var importLocations = (0, _ramda.merge)(baseImportLocations, customImportLocations);
  return generators.map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        file = _ref4[0],
        _ref4$ = _slicedToArray(_ref4[1], 2),
        de = _ref4$[0],
        deps = _ref4$[1];

    return [file, de(), deps];
  }).map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 3),
        file = _ref6[0],
        code = _ref6[1],
        deps = _ref6[2];

    var headerCode = header(baseDir, typeLocations, importLocations, deps);
    var hoistedCode = hoist(deps.hoists);
    return [file, _prettier["default"].format("".concat(headerCode, "\n").concat(hoistedCode, "export default ").concat(code), prettierArgs), deps];
  });
};

exports.codeGen = codeGen;

var fileGen = function fileGen(baseDir, typeLocations, customImportLocations, generators) {
  return Promise.all(codeGen(baseDir, typeLocations, customImportLocations, generators).map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        file = _ref8[0],
        code = _ref8[1];

    return stringToFilePromise(file, code);
  })).then(function () {
    console.log('done!');
  });
};

exports.fileGen = fileGen;