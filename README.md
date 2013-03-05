# mapArgs
map function parameters to types

## installation

    $ npm install mapargs

## usage

Stop manually writing mapping and validation logic. Stop it right now. It's brittle and not fun.

    var mapArgs = require('mapargs')

    var listDocuments = mapArgs({
      authorId: Number,
      skip: {$map: Number, $optional: true, $default: 0},
      limit: {$map: Number, $optional: true, $default: 100}
    }, function (authorId, skip, limit) {
      // do stuff
    })

This returns a function which we can call either with positional arguments (like the original), or named arguments by passing in an object with property names matching the parameter names.

    listDocuments({name: 'f43', skip: '100'})
    // equivalent to calling the original function with
    // fn(43, 100, 100)

Use this when wiring up user input to application logic. Separate your gnarly HttpRequest objects from your core domain functions. Automatically map objects to their constructors.



## api

### mapArgs(mapObj, fn)

`mapObj` should have property names corresponding to `fn`'s parameter names.
The values should be either mapping functions to be applied to the matching argument or an `options` object.

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

## running the tests

change to package root directory

    $ npm install
    $ npm test

## contributors

jden <jason@denizac.org>

## license

MIT. (c) 2013 Agile Diagnosis <hello@agilediagnosis>. See LICENSE.md