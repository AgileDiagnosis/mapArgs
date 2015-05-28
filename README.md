# mapargs
map function parameters to types

## installation

    $ npm install mapargs

## usage

Stop manually writing mapping and validation logic. Stop it right now. It's brittle and not fun.

    var mapArgs = require('mapargs')

    var listDocuments = mapArgs(function (authorId, skip, limit) {
      // do stuff
    }, {
      authorId: Number,
      skip: {$map: Number, $optional: true, $default: 0},
      limit: {$map: Number, $optional: true, $default: 100}
    })

This returns a function which we can call either with positional arguments (like the original), or named arguments by passing in an object with property names matching the parameter names.

    listDocuments({name: 'f43', skip: '100'})
    // equivalent to calling the original function with
    // fn(43, 100, 100)

Use this when wiring up user input to application logic. Separate your gnarly HttpRequest objects from your core domain functions. Automatically map objects to their constructors.



## api

### mapArgs(fn: Function, mapObj?: Object) => Function

Returns a function which accepts named arguments and (optionally) has validation and defaults specified in mapObj

    var add3 = function (a, b, c) {
      return a + b + c
    }

    var named = mapArgs(add3)

    named({a: 1, b: 2, c: 3})
    // => 6


`mapObj` should have property names corresponding to `fn`'s parameter names.
The values should be either mapping functions to be applied to the matching argument or an `options` object.

## mapArgs.validate(mapObj: Object) => Function

Returns a function which will apply all of the validation and default logic and return an arguments object or throw an error.

## options

### $map: Function
A mapping function to be applied to the matching argument

### $default: Value
A value used when the argument is not supplied or is undefined

### $valid: Predicate Function
A function returning `true` if the argument is valid, `false` otherwise. `mapArgs` will throw an `Error` if the validation fails. Validation is run after the mapping function is applied.

### $optional: Boolean
If `true`, the parameter is optional. If a default is specified, it will be used if the argument is undefined. If there is no default specified and the parameter is not marked optional, an error will be thrown.

## a note about booleans

We treat the built-in `Boolean` constructor liberally. Unlike native `Boolean`, not all non-empty strings evaluate to true. Instead, only strings which case-insensitively compare to `t`, `true`, `y`, or `yes` are true; otherwise they're false. And only numbers > 0 evaluate to true; otherwise they're false.

## running the tests

change to package root directory

    $ npm install
    $ npm test

## contributors

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

jden <jason@denizac.org>

## license

ISC. (c) 2015 AgileMD, Inc <hello@agilemd.com>. See LICENSE.md