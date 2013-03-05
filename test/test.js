var chai = require('chai')
chai.should()
var expect = chai.expect

var mapArgs = require('../index')

describe('mapArgs', function () {
  it('works with named args', function () {

    var ID = function (id) { return id.toString(16).toUpperCase() }

    var fn = mapArgs({id: ID, name: String }, function (id, name) {
      return [id, name];
    })

    var ret = fn({name: 'Tom', id: 0xc0ffee })

    ret.should.deep.equal(['C0FFEE', 'Tom'])
  })

  it('works with positional args', function () {

    var fn = mapArgs({a: Number, b: String}, function (a, b) {
      return [a, b]
    })

    var ret = fn('23', false)

    ret.should.deep.equal([23, 'false'])

  })

  it('can figure out unary functions called with named args', function () {
    var fn = mapArgs({a: Number}, function (a) { return -a; })

    fn({a: 2}).should.equal(-2)
    fn(2).should.equal(-2)
  })

  it('throws if any of the functions throws', function () {
    var throws = function() { throw new Error() }

    var fn= mapArgs({a: throws }, function (a) { })

    expect(function () {
      fn(12)
    }).to.throw('Invalid argument: a')
  })

  describe('optional parameters', function () {
    it('will ignore missing optional parameters', function () {
      var fn = mapArgs({a: Number, b: {$optional: true, $map: Number}}, function (a, b) {

      })
    })

    it('passes the value through if no mapping function is defined', function () {
      var fn = mapArgs({a: {$optional: true}}, function (a) { return a });

      fn('234').should.equal('234')
      fn() // should not throw
    })

    it('can have a default', function () {
      var fn = mapArgs({a: {$optional: true, $default: 'foo'}}, function (a) {
        return a;
      })

      fn('boo').should.equal('boo')
      fn().should.equal('foo')
    })
  })

  describe('boolean', function () {
    it('supports liberal boolean input', function () {
      var fn = mapArgs({a: Boolean}, function (a) { return a; })

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
      var fn = mapArgs({a: {$valid: isEven }}, function (a) { return a })
      fn(2).should.equal(2)
    })
    it('throws if the predicate returns false', function () {
      var fn = mapArgs({a: {$valid: isEven }}, function (a) { return a })
      expect(function () {
        fn(1)
      }).to.throw('Invalid argument: a')
    })
  })

})