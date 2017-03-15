'use strict'

const test = require('tap').test
const sinon = require('sinon')
const translateUtils = require('../../../utils/translateWhereToQuery')
const utils = require('../../../utils/utils')

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
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

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
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

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
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

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
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

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
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

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
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

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
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

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = ''
  const key = 'Value'
  const where = {
    Value: 'TestString'
  }
  const queryString = `(${key} eq '${(where[key])}')`

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})

test('### Should returns string query ###', function (t) {
  const resolveValueStub = sinon.stub(utils, 'resolveValue', (value) => {
    return typeof value === 'string' ? `'${value}'` : `${value}`
  })

  const str = 'nonEmptyString'
  const key = 'Value'
  const where = {
    Value: 'TestString'
  }
  const queryString = `${str} and (${key} eq '${(where[key])}')`

  var resultQuery = translateUtils.translateWhereToQuery(where, str, key)

  t.equal(resultQuery, queryString)
  t.ok(resolveValueStub.calledOnce)
  resolveValueStub.restore()
  t.end()
})
