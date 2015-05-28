/* globals describe, it */
var chai = require('chai')
chai.should()
var expect = chai.expect

var mapargs = require('../index')

describe('mapargs', function () {
  it('works with named args', function () {
    var ID = function (id) { return id.toString(16).toUpperCase() }

    var fn = mapargs(function (id, name) {
      return [id, name]
    }, {id: ID, name: String })

    var ret = fn({name: 'Tom', id: 0xc0ffee })

    ret.should.deep.equal(['C0FFEE', 'Tom'])
  })

  it('throws if any of the functions throws', function () {
    var throws = function () { throw new Error() }

    var fn = mapargs(function (a) {}, {a: throws })

    expect(function () {
      fn({a: 12})
    }).to.throw('Invalid argument: a')
  })

  describe('optional parameters', function () {
    it('parameters are required unless $default or $optional', function () {
      var fn = function (a, b, c) { return [a, b, c] }
      var mapped = mapargs(fn, {b: {$default: 'B'}, c: {$optional: true}})

      expect(function () {
        mapped({})
      }).to.throw(/Missing required parameter: a/)

      mapped({a: 'A'}).should.deep.equal(['A', 'B', undefined])
      mapped({a: 'a', b: 'b'}).should.deep.equal(['a', 'b', undefined])
      mapped({a: 1, b: 2, c: 3}).should.deep.equal([1, 2, 3])
    })

    it('passes the value through if no mapping function is defined', function () {
      var fn = mapargs(function (a) { return a }, {a: {$optional: true}})

      fn({a: '234'}).should.equal('234')
    })

    it('can have a default', function () {
      var fn = mapargs(function (a) {
        return a
      }, {a: {$default: 'foo'}})

      fn({a: 'boo'}).should.equal('boo')
      fn().should.equal('foo')
    })

    it('parameters are required by default', function () {
      var fn = mapargs(function (a, b) {
        return [a, b]
      }, {b: {$default: 'B'}})

      fn({a: 'A'}).should.deep.equal(['A', 'B'])
      expect(function () {
        fn()
      }).to.throw(/Missing required parameter: a/)

    })
  })

  describe('boolean', function () {
    it('supports liberal boolean input', function () {
      var fn = mapargs(function (a) { return a }, {a: Boolean})

      var t = [true, 1, 'true', 't', 'TRUE', 'trUE', 'yes', 'Y', 'y', 'YES']
      t.forEach(function (val) {
        fn({a: val}).should.equal(true)
      })

      var f = [false, 0, -1, 'f', 'F', 'false', 'FAlse', 'n', 'NO', 'N']
      f.forEach(function (val) {
        fn({a: val}).should.equal(false)
      })

    })
  })

  describe('predicate validation', function () {
    var isEven = function (x) { return x % 2 === 0 }

    it('passes the value through if the predicate returns true', function () {
      var fn = mapargs(function (a) { return a }, {a: {$valid: isEven }})
      fn({a: 2}).should.equal(2)
    })
    it('throws if the predicate returns false', function () {
      var fn = mapargs(function (a) { return a }, {a: {$valid: isEven }})
      expect(function () {
        fn({a: 1})
      }).to.throw('Invalid argument: a')
    })
  })

  describe('.toNamedParamFn', function () {
    it('wraps a function to accept named parameters in an argument object', function () {
      var add3 = function (a, b, c) {
        return a + b + c
      }

      var named = mapargs._toNamedParamFn(add3)

      named({a: 1, b: 2, c: 3}).should.equal(6)

    })
  })

  describe('.validate', function () {
    it('maps and validate arguments only without mapping parameters to a function', function () {
      var map = mapargs.validate({id: Number, name: {$optional: true}, day: {$default: 'Tues'}, coffee: {$valid: function (x) { return x === 'YES'}}})

      var mapped = map({id: '2', coffee: 'YES'})

      mapped.should.deep.equal({id: 2, coffee: 'YES', day: 'Tues'})

    })
  })

})
