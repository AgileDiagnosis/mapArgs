var I = require('ski/i')
var fninfo = require('fninfo')

function collection () {
  var arr = []
  arr.has = {}
  arr.add = function (x) {
    arr.push(x)
    arr.has[x] = true
  }
  return arr
}

function mapArgs (fn, mapObj) {
  mapObj = mapObj || {}
  var params = fninfo(fn).params
  var required = collection()
  var optional = collection()
  var defaults = {}
  var valid = {}

  // parse options
  Object.keys(mapObj).forEach(function (param) {
    var arg = mapObj[param]

    if (typeof arg === 'function') {
      required.add(param)
      return
    }

    if (arg.$optional) {
      optional.add(param)
    } else {
      required.add(param)
    }

    if ('$valid' in arg) {
      valid[param] = arg.$valid
    }

    if ('$default' in arg) {
      defaults[param] = arg.$default
    }

    mapObj[param] = arg.$map

  })

  function map (args) {
    args = args[0] || {}

    if (typeof args !== 'object') {
      throw new Error('expecting single parameter: args object')
    }

    var outArgs = []
    params.forEach(function (param, i) {
      if (!(param in args || param in defaults || param in optional.has)) {
        throw new Error('Missing required parameter: ' + param)
      }

      var arg = args[param]

      if (arg === void 0) {
        arg = defaults[param]
      }

      try {
        var mapFn = mapObj[param] || I
        if (mapFn === Boolean) {
          mapFn = boolean
        }
        outArgs[i] = mapFn(arg)

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

// undocumented, not for external use
function toNamedParamFn (fn) {
  var params = fninfo(fn).params

  if (params.length === 0) {
    return fn
  }

  if (params.length === 1) {
    return function (arg) {
      return fn.call(this, arg[params[0]])
    }
  }

  if (params.length === 2) {
    return function (args) {
      return fn.call(this, args[params[0]], args[params[1]])
    }
  }

  if (params.length === 3) {
    return function (args) {
      return fn.call(this, args[params[0]], args[params[1]], args[params[2]])
    }
  }

  return function (args) {
    args = params.map(function (param) { return args[param] })
    return fn.apply(this, args)
  }
}

function mapArgsObj (mapObj) {
  var required = collection()
  var optional = collection()
  var defaults = {}
  var valid = {}

  Object.keys(mapObj).forEach(function (param) {
    var arg = mapObj[param]

    if (typeof arg === 'function') {
      required.add(param)
      return
    }

    if (arg.$optional) {
      optional.add(param)
    } else {
      required.add(param)
    }

    if ('$valid' in arg) {
      valid[param] = arg.$valid
    }

    if ('$default' in arg) {
      defaults[param] = arg.$default
    }

    mapObj[param] = arg.$map

  })

  return function map (args) {
    args = omap(args, function (arg, param) {
      try {
        var mapFn = mapObj[param] || I
        if (mapFn === Boolean) {
          mapFn = boolean
        }
        arg = mapFn(arg)

      } catch (e) {
        var err = new Error('Invalid argument: ' + param)
        err.inner = e
        throw err
      }
      if (valid[param] && !valid[param](arg)) {
        throw new Error('Invalid argument: ' + param)
      }

      return arg
    })

    for (var key in defaults) {
      if (args[key] === void 0) {
        args[key] = defaults[key]
      }
    }

    required.forEach(function (param) {
      if (!args.hasOwnProperty(param)) {
        throw new Error('Missing required parameter: ' + param)
      }
    })

    return args
  }

}

var boolean = function (x) {
  if (typeof x === 'string') {
    x = x.toLowerCase()
    return (x === 't' || x === 'true' || x === 'y' || x === 'yes')
  }
  if (typeof x === 'number') {
    return x > 0
  }
  return !!x
}

function omap (object, visitor) {
  var o = {}
  for (var key in object) {
    o[key] = visitor(object[key], key)
  }
  return o
}

module.exports = mapArgs
module.exports.validate = mapArgsObj
module.exports._toNamedParamFn = toNamedParamFn
