/* globals describe, it */
var chai = require('chai')
chai.should()
var expect = chai.expect

var mapArgs = require('../index')

describe('mapArgs', function () {
  it('works with named args', function () {
    var ID = function (id) { return id.toString(16).toUpperCase() }

    var fn = mapArgs(function (id, name) {
      return [id, name]
    }, {id: ID, name: String })

    var ret = fn({name: 'Tom', id: 0xc0ffee })

    ret.should.deep.equal(['C0FFEE', 'Tom'])
  })

  it('works with positional args', function () {
    var fn = mapArgs(function (a, b) {
      return [a, b]
    }, {a: Number, b: String})

    var ret = fn('23', false)

    ret.should.deep.equal([23, 'false'])

  })

  it('can figure out unary functions called with named args', function () {
    var fn = mapArgs(function (a) { return -a }, {a: Number})

    fn({a: 2}).should.equal(-2)
    fn(2).should.equal(-2)
  })

  it('throws if any of the functions throws', function () {
    var throws = function () { throw new Error() }

    var fn = mapArgs(function (a) {}, {a: throws })

    expect(function () {
      fn(12)
    }).to.throw('Invalid argument: a')
  })

  describe('optional parameters', function () {
    it('will ignore missing optional parameters', function () {
      mapArgs(function (a, b) {}, {a: Number, b: {$optional: true, $map: Number}})
    })

    it('passes the value through if no mapping function is defined', function () {
      var fn = mapArgs(function (a) { return a }, {a: {$optional: true}})

      fn('234').should.equal('234')
      fn() // should not throw
    })

    it('can have a default', function () {
      var fn = mapArgs(function (a) {
        return a
      }, {a: {$default: 'foo'}})

      fn('boo').should.equal('boo')
      fn().should.equal('foo')
    })
  })

  describe('boolean', function () {
    it('supports liberal boolean input', function () {
      var fn = mapArgs(function (a) { return a }, {a: Boolean})

      var t = [true, 1, 'true', 't', 'TRUE', 'trUE', 'yes', 'Y', 'y', 'YES']
      t.forEach(function (val) {
        fn(val).should.equal(true)
      })

      var f = [false, 0, -1, 'f', 'F', 'false', 'FAlse', 'n', 'NO', 'N']
      f.forEach(function (val) {
        fn(val).should.equal(false)
      })

    })
  })

  describe('predicate validation', function () {
    var isEven = function (x) { return x % 2 === 0 }

    it('passes the value through if the predicate returns true', function () {
      var fn = mapArgs(function (a) { return a }, {a: {$valid: isEven }})
      fn(2).should.equal(2)
    })
    it('throws if the predicate returns false', function () {
      var fn = mapArgs(function (a) { return a }, {a: {$valid: isEven }})
      expect(function () {
        fn(1)
      }).to.throw('Invalid argument: a')
    })
  })

  describe('.toNamedParamFn', function () {
    it('wraps a function to accept named parameters in an argument object', function () {
      var add3 = function (a, b, c) {
        return a + b + c
      }

      var named = mapArgs.toNamedParamFn(add3)

      named({a: 1, b: 2, c: 3}).should.equal(6)

    })
  })

  describe('.validate', function () {
    it('maps and validate arguments only without mapping parameters to a function', function () {
      var map = mapArgs.validate({id: Number, name: {$optional: true}, day: {$default: 'Tues'}, coffee: {$valid: function (x) { return x === 'YES'}}})

      var mapped = map({id: '2', coffee: 'YES'})

      mapped.should.deep.equal({id: 2, coffee: 'YES', day: 'Tues'})

    })
  })

})
