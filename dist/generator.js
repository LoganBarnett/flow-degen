"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeDeps = mergeDeps;
exports.degenMaybe = exports.degenRefiner = exports.de = exports.degenValue = exports.degenType = exports.flattenTypes = exports.typeHeader = exports.degenSum = exports.degenSentinelValue = exports.degenNumber = exports.degenBool = exports.degenEnum = exports.degenFilePath = exports.degenString = exports.degenMapping = exports.degenList = exports.degenField = exports.degenObject = exports.maybeMap = void 0;

var _ramda = require("ramda");

var _deserializer2 = require("./deserializer.js");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var maybeMap = function maybeMap(unwrap, error, x) {
  if (x instanceof Error) {
    return error(x);
  } else {
    return unwrap(x);
  }
};

exports.maybeMap = maybeMap;

function mergeDeps(a, b) {
  return {
    imports: (0, _ramda.concat)(a.imports, b.imports),
    types: (0, _ramda.concat)(a.types, b.types),
    hoists: (0, _ramda.concat)(a.hoists, b.hoists)
  };
}

var degenObject = function degenObject(deType, requiredFields, optionalFields) {
  var fieldDeps = (0, _ramda.reduce)(mergeDeps, {
    imports: [],
    types: [],
    hoists: []
  }, (0, _ramda.map)(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        _ref2$ = _slicedToArray(_ref2[1], 2),
        deps = _ref2$[1];

    return deps;
  }, requiredFields).concat((0, _ramda.map)(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        _ref4$ = _slicedToArray(_ref4[1], 2),
        deps = _ref4$[1];

    return deps;
  }, optionalFields)));
  return [function () {
    // Is there an R.unzip?
    // No.
    var requiredFieldNames = (0, _ramda.map)(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 1),
          n = _ref6[0];

      return n;
    }, requiredFields);
    var requiredFieldRefiners = (0, _ramda.map)(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
          f = _ref8[1];

      return f[0]();
    }, requiredFields);
    var optionalFieldRefiners = (0, _ramda.map)(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          f = _ref10[1];

      return f[0]();
    }, optionalFields);
    var typeRefiner = degenType(deType);
    var typeName = typeRefiner[0]();
    return "(json: mixed): ".concat(typeName, " | Error => {\n  if(json === null) {\n    return new Error('Could not deserialize json because the value is null.')\n  }\n  else if(typeof json == 'undefined') {\n    return new Error('Could not deserialize json because the value is undefined.')\n  }\n  else if(json instanceof Error || typeof json != 'object') {\n    return new Error('Could not deserialize object \"' + String(json) + '\"')\n  }\n  else {\n    ").concat(requiredFields.map(function (_ref11) {
      var _ref12 = _slicedToArray(_ref11, 2),
          name = _ref12[0],
          refiner = _ref12[1];

      // The { is matched towards the end of the generator.
      return "const ".concat(name, " = ").concat(refiner[0](), "\nif(").concat(name, " instanceof Error) {\n  return ").concat(name, "\n} else {\n");
    }).join('\n'), "\n      const result = {}\n        ").concat(requiredFieldNames.map(function (f) {
      return "result.".concat(f, " = ").concat(f);
    }).join('\n'), "\n      ").concat(optionalFields.map(function (_ref13) {
      var _ref14 = _slicedToArray(_ref13, 2),
          name = _ref14[0],
          refiner = _ref14[1];

      return "if(json.hasOwnProperty('".concat(name, "')) {\n  const ").concat(name, " = ").concat(refiner[0](), "\n  if(").concat(name, " instanceof Error) {\n    return ").concat(name, "\n  } else {\n    result.").concat(name, " = ").concat(name, "\n  }\n}");
    }).join('\n'), "\n      return result\n    ").concat((0, _ramda.times)(function () {
      return '}';
    }, (0, _ramda.length)(requiredFieldRefiners)).join(''), "\n  }\n}\n");
  }, mergeDeps(fieldDeps, {
    types: [deType],
    imports: [],
    hoists: []
  })];
};

exports.degenObject = degenObject;

var degenField = function degenField(fieldName, deserializer) {
  var _deserializer = _slicedToArray(deserializer, 2),
      deserializerFn = _deserializer[0],
      deps = _deserializer[1];

  return [fieldName, [function () {
    // the `else {` is terminated in deObject during the join.
    return "deField('".concat(fieldName, "',\n        (").concat(deserializerFn(), "),\n        json.").concat(fieldName, ")");
  }, mergeDeps(deps, {
    types: [],
    imports: ['deField'],
    hoists: []
  })]];
};

exports.degenField = degenField;

var degenList = function degenList(metaType, element) {
  var _element = _slicedToArray(element, 2),
      elementDeserializer = _element[0],
      deps = _element[1];

  return [function () {
    return "(\ndeList.bind(null, ".concat(elementDeserializer(), "):\n(mixed) => Array<").concat(typeHeader(metaType), "> | Error\n)");
  }, mergeDeps(deps, {
    types: [metaType],
    imports: ['deList'],
    hoists: []
  })];
};

exports.degenList = degenList;

var degenMapping = function degenMapping(keyMetaType, valueMetaType, keyGenerator, valueGenerator) {
  var _keyGenerator = _slicedToArray(keyGenerator, 2),
      keyDeserializer = _keyGenerator[0],
      keyDeps = _keyGenerator[1];

  var _valueGenerator = _slicedToArray(valueGenerator, 2),
      valueDeserializer = _valueGenerator[0],
      valueDeps = _valueGenerator[1];

  var deps = {
    types: [keyMetaType, valueMetaType],
    imports: ['deMapping'],
    hoists: []
  };
  return [function () {
    return "(\ndeMapping.bind(null, ".concat(keyDeserializer(), ", ").concat(valueDeserializer(), "):\n(mixed) => { [").concat(typeHeader(keyMetaType), "]: ").concat(typeHeader(valueMetaType), " } | Error\n)");
  }, mergeDeps(mergeDeps(keyDeps, valueDeps), deps)];
};

exports.degenMapping = degenMapping;

var degenString = function degenString() {
  return [function () {
    return "deString";
  }, {
    types: [{
      name: 'string',
      typeParams: []
    }],
    imports: ['deString'],
    hoists: []
  }];
}; // Right now I don't know how we'd verify what a file path looks like other than
// checking to see if there's an extension (which needn't always be the case).
// For now this gives us semantic expressions at least.


exports.degenString = degenString;
var degenFilePath = degenString;
exports.degenFilePath = degenFilePath;

var degenEnum = function degenEnum(deType, values) {
  var _degenString = degenString(),
      _degenString2 = _slicedToArray(_degenString, 2),
      stringGen = _degenString2[0],
      deps = _degenString2[1];

  return [function () {
    // Needs triple equals here.
    var check = values.map(function (x) {
      return "'".concat(x, "'");
    }).join(' === either || ') + ' === either';
    var oneOf = values.join(', ');
    var typeName = degenType(deType)[0]();
    return "(v: mixed): ".concat(typeName, " | Error => {\n  const either = ").concat(stringGen(), "(v)\n  if(either instanceof Error) {\n    return new Error('Could not deserialize \"' + String(v) +'\" into enum \"").concat(typeName, "\":' + either.message)\n  }\n  else {\n    if(").concat(check, ") {\n      return either\n    }\n    else {\n      return new Error('Could not deserialize \"' + String(v) +\"' into one of the enum values: ").concat(oneOf, "'\")\n    }\n  }\n}");
  }, mergeDeps(deps, {
    types: [deType],
    imports: [],
    hoists: []
  })];
};

exports.degenEnum = degenEnum;

var degenBool = function degenBool() {
  return [function () {
    return "deBool";
  }, {
    types: [],
    imports: ['deBool'],
    hoists: []
  }];
};

exports.degenBool = degenBool;

var degenNumber = function degenNumber() {
  return [function () {
    return "deNumber";
  }, {
    types: [],
    imports: ['deNumber'],
    hoists: []
  }];
};

exports.degenNumber = degenNumber;

var degenSentinelValue = function degenSentinelValue(key, deserializer) {
  return {
    key: key,
    deserializer: deserializer
  };
};

exports.degenSentinelValue = degenSentinelValue;

var sentinelPropToCase = function sentinelPropToCase(x) {
  return "case '".concat(x.key, "':\n  return (").concat(x.deserializer[0](), ")(x)\n");
};

var addReturnToCase = function addReturnToCase(kase) {
  return "".concat(kase, "\nreturn x");
};

var degenSum = function degenSum(deType, sentinelField, sentinelFieldType, props) {
  var fnName = "".concat(deType.name, "Refine");
  var typeHeader = degenType(deType)[0](); // Type declaration needs to be outside the function or we get "name already
  // bound"

  var enumGen = degenEnum(sentinelFieldType, props.map(function (p) {
    return p.key;
  }));
  var hoist = "\n// Exhaustive union checks don't work, but there is a workaround.\n// See: https://github.com/facebook/flow/issues/3790\ntype ".concat(deType.name, "UnreachableFix = {| '@@flow-degen/unreachable-fix': 'false-field' |}\ntype ").concat(deType.name, "ExhaustiveUnionFix = ").concat(sentinelFieldType.name, " | ").concat(deType.name, "UnreachableFix\nconst ").concat(fnName, " = (x: mixed): ").concat(typeHeader, " | Error => {\n  if(x != null && typeof x == 'object' && x.hasOwnProperty('").concat(sentinelField, "')\n&& typeof x.").concat(sentinelField, " == 'string') {\n    const sentinelValue = (").concat(enumGen[0](), ")(x.").concat(sentinelField, ")\n    if(sentinelValue instanceof Error) {\n      return new Error('Sentinel field ").concat(sentinelField, " could not deserialize properly: ' + sentinelValue.message)\n    }\n    else {\n      const union: ").concat(deType.name, "ExhaustiveUnionFix = sentinelValue\n      switch(union) {\n        ").concat((0, _ramda.pipe)((0, _ramda.map)(sentinelPropToCase))(props).join('\n'), "\n      default:\n        // Fixes Flow's inability to cover exhaustive cases.\n        ;(union: ").concat(deType.name, "UnreachableFix)\n        return new Error('unreachable')\n      }\n    }\n  }\n  else {\n    return new Error('Could not deserialize object into ").concat(deType.name, ": ' + stringify(x))\n  }\n}");
  return [function () {
    return "".concat(fnName);
  }, (0, _ramda.reduce)(mergeDeps, {
    types: [deType, sentinelFieldType],
    imports: ['stringify'],
    hoists: [hoist]
  }, (0, _ramda.append)(enumGen[1], (0, _ramda.map)(function (y) {
    return y[1];
  }, (0, _ramda.map)((0, _ramda.prop)('deserializer'), props))))];
};

exports.degenSum = degenSum;

var typeHeader = function typeHeader(type) {
  if (type.typeParams && type.typeParams.length > 0) {
    var params = type.typeParams.map(typeHeader);
    return "".concat(type.name, "<").concat(params.join(', '), ">");
  } else {
    // Kind of a weird case to support.
    return type.name;
  }
};

exports.typeHeader = typeHeader;

var flattenTypes = function flattenTypes(type) {
  if (type.literal) {
    return [];
  } else {
    var nestedTypes = type.typeParams ? type.typeParams.map(flattenTypes) : [];
    return (0, _ramda.reduce)(_ramda.concat, [type], nestedTypes);
  }
};

exports.flattenTypes = flattenTypes;

var degenType = function degenType(type) {
  return [function () {
    return typeHeader(type);
  }, {
    types: [],
    imports: [],
    hoists: []
  }];
};

exports.degenType = degenType;

var degenValue = function degenValue(type, value) {
  return [function () {
    return "(x: mixed) => {\n  if(typeof x != '".concat(type, "') {\n    return new Error('Could not deserialize \"' + String(x) + '\" into a ").concat(type, ".')\n  }\n  else if(x === ").concat((0, _deserializer2.stringify)(value), "){\n    return x\n  }\n  else {\n    return new Error('Could not deserialize \"' + String(x) + '\" into a ").concat(type, " with the value ").concat((0, _deserializer2.stringify)(value), ".')\n  }\n}");
  }, {
    types: [],
    imports: ['stringify'],
    hoists: []
  }];
};

exports.degenValue = degenValue;

var de = function de(type, deserializer) {
  return "genHook.genDe".concat(type, " = ").concat(deserializer[0]());
};

exports.de = de;

var degenRefiner = function degenRefiner(refinerType, refinerSymbol) {
  return [function () {
    return refinerSymbol;
  }, {
    types: [refinerType],
    imports: [refinerSymbol],
    hoists: []
  }];
};

exports.degenRefiner = degenRefiner;

var degenMaybe = function degenMaybe(refinerType, refiner) {
  var _refiner = _slicedToArray(refiner, 2),
      code = _refiner[0],
      dependencies = _refiner[1];

  return [function () {
    return "\n        (x: mixed): ?".concat(typeHeader(refinerType), " | Error => {\n          if (x != null) {\n            const refiner = ").concat(code(), "\n\n            return refiner(x)\n          } else {\n            return null\n          }\n        }\n      ");
  }, mergeDeps(dependencies, {
    types: [refinerType],
    imports: [],
    hoists: []
  })];
};

exports.degenMaybe = degenMaybe;