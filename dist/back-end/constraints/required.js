"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintsRequired;

var _namespaces = require("../namespaces");

function constraintsRequired(values, options) {
  //no values
  if (values.length === 0) {
    return false;
  } //1 or more values/input boxes
  else if (values.length > 0) {
      var _options$store$match$, _options$store$match$2;

      //check if there is a language constraint
      const languageConstraint = (_options$store$match$ = options.store.match(options.constraintUri, (0, _namespaces.FORM)('language'), undefined)[0]) === null || _options$store$match$ === void 0 ? void 0 : (_options$store$match$2 = _options$store$match$.object) === null || _options$store$match$2 === void 0 ? void 0 : _options$store$match$2.value;

      if (languageConstraint) {
        var _value$value;

        //match the value to the constraint
        //this is wierd since it will fail if there are multiple same language paths
        const value = values.find(value => value.language === languageConstraint);

        if ((value === null || value === void 0 ? void 0 : (_value$value = value.value) === null || _value$value === void 0 ? void 0 : _value$value.length) === 0) {
          return false;
        }
      } else {
        //no way to determine which box is validated so we validate all of them
        //this will cause ui bugs
        for (const value of values) {
          var _value$value2;

          if (((_value$value2 = value.value) === null || _value$value2 === void 0 ? void 0 : _value$value2.length) === 0) {
            return false;
          }
        }
      }
    }

  return true;
}