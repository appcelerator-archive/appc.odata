'use strict'

const test = require('tap').test

const utils = require('../../../utils/utils')

test('### Should transform Object to array ###', function (t) {
  const arr = utils.objectToArray({ a: 1, b: 2 })

  t.ok(arr)
  t.equal(arr.length, 1)
  t.equal(arr[0].a, 1)
  t.equal(arr[0].b, 2)
  t.end()
})

test('### Should create mixin ###', function (t) {
  const obj = utils.mixin('people', {
    t1: {
      people: {
        name: 'x'
      }
    },
    t2: {
      people: {
        name: 'y'
      }
    }
  })

  t.ok(obj)
  t.type(obj, 'object')
  t.ok(obj.name)
  t.equal(obj.name, 'y')
  t.end()
})

test('### Should resolve string value ###', function (t) {
  const val = utils.resolveValue('xx')

  t.ok(val)
  t.equal(val, "'xx'")
  t.end()
})

test('### Should resolve number value ###', function (t) {
  const val = utils.resolveValue(22)

  t.ok(val)
  t.equal(val, '22')
  t.end()
})
