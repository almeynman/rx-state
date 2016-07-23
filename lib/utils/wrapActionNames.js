"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = wrapActionNames;
function wrapActionNames(actionNames, actions) {
  var result = {};
  actionNames.mapKeys(function (key) {
    return result[key] = actionNames[key] ? actions.get(actionNames[key]) : actions.get(key);
  });
  return result;
}