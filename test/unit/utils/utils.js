'use strict'

const test = require('tap').test
const sinon = require('sinon')
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

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'like'
  const where = {
    like: {
      $like: 'TestLike'
    }
  }
  const queryString = `(substringof('${(where['like'].$like)}', ${key})`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: {
      $lt: 'TestLt'
    }
  }
  const queryString = `(${key} lt '${(where[key].$lt)}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: {
      $lte: 'TestLte'
    }
  }
  const queryString = `(${key} le '${(where[key].$lte)}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: {
      $gt: 'TestGt'
    }
  }
  const queryString = `(${key} gt '${(where[key].$gt)}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: {
      $gte: 'TestGte'
    }
  }
  const queryString = `(${key} ge '${(where[key].$gte)}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: {
      $ne: 'TestNe'
    }
  }
  const queryString = `(${key} ne '${(where[key].$ne)}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: {
      $eq: 'TestEq'
    }
  }
  const queryString = `(${key} eq '${(where[key].$eq)}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: 'TestString'
  }
  const queryString = `(${key} eq '${(where[key])}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue').callsFake((value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = 'nonEmptyString'
  const key = 'Value'
  const where = {
    Value: 'TestString'
  }
  const queryString = `${str} and (${key} eq '${(where[key])}')`

  var resultQuery = utils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### getMainUrl should return correct string ###', function (t) {
  const url = 'service/$metadata'
  var mainUrl = utils.getMainUrl(url)
  t.equals(mainUrl, 'service/')
  t.end()
})

test('### getMainUrl should return correct string ###', function (t) {
  const url = 'service/'
  var mainUrl = utils.getMainUrl(url)
  t.equals(mainUrl, 'service/')
  t.end()
})

test('### getMainUrl should return correct string ###', function (t) {
  const url = 'service'
  var mainUrl = utils.getMainUrl(url)
  t.equals(mainUrl, 'service/')
  t.end()
})
