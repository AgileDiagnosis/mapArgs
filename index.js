var I = require('ski/i')

function collection () {
  var arr = []
  arr.has = {}
  arr.add = function (x) {
    arr.push(x)
    arr.has[x] = true
  }
  return arr;
}

function mapArgs (mapObj, fn) {
  var params = parseFnParams(fn)
  var required = collection()
  var optional = collection()
  var defaults = {}
  var valid = {}

  Object.keys(mapObj).forEach(function (param) {
    var arg = mapObj[param]

    if (typeof arg === 'function') {
      required.add(param)
      return;
    }

    if (arg.$optional) {
      optional.add(param)
    } else {
      required.add(param)
    }

    if ('$valid' in arg) {
      valid[param] = arg.$valid
    }

    defaults[param] = arg.$default

    mapObj[param] = arg.$map

  })


  function map(args) {
    if (args.length === 1) {
      // determine if called with named or positional args
      if (typeof args[0] === 'object' &&
        required.every(function (param) { return args[0].hasOwnProperty(param) })) {
        // called with named args
        args = args[0]
      } else {
        // called with one positional arg
        args = toObj(params, args)
      }
    } else {
      args = toObj(params, args)
    }

    var outArgs = [];
    params.forEach(function (param, i) {
      if (!(args.hasOwnProperty(param) || optional[param])) {
        throw new Error('Missing required parameter: ' + param)
      }
      var arg = args[param]

      if (arg === void 0) {
        arg = defaults[param]
      }

      try{
        var mapFn = mapObj[param] || I
        if (mapFn === Boolean) {
          mapFn = boolean;
        }
        outArgs[i] = mapFn.call(null, arg)

      } catch (e) {
        var err = new Error('Invalid argument: ' + param)
        err.inner = e
        throw err
      }
      if (valid[param] && !valid[param](outArgs[i])) {
        throw new Error('Invalid argument: ' + param)
      }
    })

    return outArgs
  }

  return function () {
    return fn.apply(this, map(arguments))
  }

}

var boolean = function (x) {
  if (typeof x == 'string') {
    x = x.toLowerCase()
    return (x == 't' || x == 'true' || x == 'y' || x == 'yes')
  }
  if (typeof x == 'number') {
    return x > 0
  }
  return !!x
}

// var builtins = [String, Number, Array, Boolean, RegExp, Date, Object]
// function builtinify(fn) {
//   var i = builtins.indexOf(fn);
//   if (i > -1) {
//     return function (x) { }
//   }
// }

function toObj(keys, vals) {
  var obj = {}
  for (var i = 0; i < keys.length; i++){
    obj[keys[i]] = vals[i]
  }
  return obj;
}

/* regexs from Angular.js, (c) Google, MIT licensed */
var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /\s*,\s*/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function parseFnParams (fn) {
  var src = fn.toString().replace(STRIP_COMMENTS, '');
  var args = src.match(FN_ARGS)[1].split(FN_ARG_SPLIT);
  return args;
}

module.exports = mapArgs;