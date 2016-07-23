"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = bindAction;
function bindAction(subject) {
  return function () {
    return subject.next.apply(subject, arguments);
  };
}