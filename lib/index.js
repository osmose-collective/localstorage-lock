(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('core-js/stable'), require('regenerator-runtime/runtime')) :
	typeof define === 'function' && define.amd ? define(['exports', 'core-js/stable', 'regenerator-runtime/runtime'], factory) :
	(factory((global.localstoragelock = {})));
}(this, (function (exports) { 'use strict';

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

function getId() {
  return Date.now() + ":" + Math.random();
}

function runWithLock(key, fn) {
  var _this = this;

  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === undefined ? 1000 : _ref$timeout,
      _ref$lockWriteTime = _ref.lockWriteTime,
      lockWriteTime = _ref$lockWriteTime === undefined ? 50 : _ref$lockWriteTime,
      _ref$checkTime = _ref.checkTime,
      checkTime = _ref$checkTime === undefined ? 10 : _ref$checkTime,
      _ref$retry = _ref.retry,
      retry = _ref$retry === undefined ? true : _ref$retry;

  var timerRunWithLock = function timerRunWithLock() {
    return setTimeout(runWithLock.bind(null, key, fn, { timeout: timeout, lockWriteTime: lockWriteTime, checkTime: checkTime, retry: retry }), checkTime);
  };
  var result = localStorage.getItem(key);
  if (result) {

    // Check to make sure the lock hasn't expired
    var data = JSON.parse(result);
    if (data.time >= Date.now() - timeout) {
      if (retry) {
        timerRunWithLock();
      }
      return;
    } else {
      localStorage.removeItem(key);
    }
  }
  var id = getId();
  localStorage.setItem(key, JSON.stringify({ id: id, time: Date.now() }));

  // Delay a bit, to see if another worker is in this section
  setTimeout(asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var currentResult, data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            currentResult = localStorage.getItem(key);
            data = JSON.parse(currentResult);

            if (!(data.id !== id)) {
              _context.next = 5;
              break;
            }

            if (retry) {
              timerRunWithLock();
            }
            return _context.abrupt("return");

          case 5:
            _context.prev = 5;
            _context.next = 8;
            return fn();

          case 8:
            _context.prev = 8;

            localStorage.removeItem(key);
            return _context.finish(8);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, _this, [[5,, 8, 11]]);
  })), lockWriteTime);
}

function tryRunWithLock(key, fn, _ref3) {
  var _ref3$timeout = _ref3.timeout,
      timeout = _ref3$timeout === undefined ? 1000 : _ref3$timeout,
      _ref3$lockWriteTime = _ref3.lockWriteTime,
      lockWriteTime = _ref3$lockWriteTime === undefined ? 50 : _ref3$lockWriteTime,
      _ref3$checkTime = _ref3.checkTime,
      checkTime = _ref3$checkTime === undefined ? 10 : _ref3$checkTime;

  runWithLock(key, fn, { timeout: timeout, lockWriteTime: lockWriteTime, checkTime: checkTime, retry: false });
}

exports.runWithLock = runWithLock;
exports.tryRunWithLock = tryRunWithLock;

Object.defineProperty(exports, '__esModule', { value: true });

})));
