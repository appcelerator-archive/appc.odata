'use strict'

const test = require('tap').test
const sinon = require('sinon')

const schemaUtils = require('../../../utils/schemaUtils')

test('### Should transform array to object ###', sinon.test(function (t) {
  const transformed = schemaUtils.arrayToObject({ key: 'name' }, [{
    name: 't1'
  }, {
    name: 't2'
  }])

  t.ok(transformed)
  t.ok(transformed.t1)
  t.ok(transformed.t2)
  t.ok(transformed.t1.name)
  t.ok(transformed.t2.name)
  t.equal(transformed.t1.name, 't1')
  t.equal(transformed.t2.name, 't2')
  t.end()
}))

test('### Should resolve name ###', sinon.test(function (t) {
  const resolved = schemaUtils.resolveName('test', 'post')

  t.ok(resolved)
  t.equal(resolved, 'test.post')
  t.end()
}))

test('### Should resolve odata type to js type ###', sinon.test(function (t) {
  const type = schemaUtils.resolveType({
    entityTypes: [],
    complexTypes: [],
    enumTypes: []
  }, {
    model: 'Edm.SByte'
  })

  t.ok(type)
  t.equal(type, 'number')
  t.end()
}))

test('### Should pick partial object if nested property with key exists ###', sinon.test(function (t) {
  const res = schemaUtils.getResource(['entityTypes'], {
    resources: {
      entityTypes: []
    }
  })

  t.ok(res)
  t.end()
}))

test('### Should returns undefined if nested property with key not exists ###', sinon.test(function (t) {
  const res = schemaUtils.getResource(['entityTypes'], {
    resources: {}
  })

  t.notOk(res)
  t.end()
}))

test('### Should returns true if property with key exists ###', sinon.test(function (t) {
  const res = schemaUtils.hasResource(['entityTypes'], {
    resources: {
      entityTypes: []
    }
  })

  t.ok(res)
  t.end()
}))

test('### Should returns false if nested property with key not exists ###', sinon.test(function (t) {
  const res = schemaUtils.hasResource(['entityTypes'], {
    resources: {}
  })

  t.notOk(res)
  t.end()
}))
