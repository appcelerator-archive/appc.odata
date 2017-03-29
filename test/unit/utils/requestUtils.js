'use strict'

const test = require('tap').test
const sinon = require('sinon')
const mockery = require('mockery')
const Arrow = require('arrow')

const modelUtils = require('../../../utils/modelUtils')

const requestStub = sinon.stub()

// replace the module `request` with a stub object
mockery.registerMock('request', requestStub)

// Init mockery
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
})

const requestUtils = require('../../../utils/requestUtils')

test('### Should returns promise ###', sinon.test(function (t) {
  this.stub(modelUtils, 'resolveKey', (name, key) => {
    return `${key}`
  })

  const instance = requestUtils.generateRemoveRefRequest('/', 'test', 'xxx', 'People', 'name', 'yyy')

  t.ok(instance)
  t.equal(instance.constructor, Promise)
  t.end()
}))

test('### Should returns promise ###', sinon.test(function (t) {
  this.stub(modelUtils, 'resolveKey', (name, key) => {
    return `${key}`
  })

  const instance = requestUtils.generateAddRefRequest('/', 'test', 'xxx', 'People', 'name', 'yyy')

  t.ok(instance)
  t.equal(instance.constructor, Promise)
  t.end()
}))

test('### Should generate expand fields string ###', sinon.test(function (t) {
  this.stub(modelUtils, 'getFieldModelName', (modelName, prop) => {
    return 'Person'
  })

  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      person: {
        model: 'People'
      },
      student: {
        model: 'People'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const refUrl = requestUtils.generateExpandFieldsString('test')
  const refUrlWithSelect = requestUtils.generateExpandFieldsString('test', ['student'])

  t.ok(refUrl)
  t.equal(refUrl, 'person,student')

  t.ok(refUrlWithSelect)
  t.equal(refUrlWithSelect, 'student')

  t.end()
}))

test('### Should returns promise ###', sinon.test(function (t) {
  this.stub(modelUtils, 'resolveKey', (name, key) => {
    return `${key}`
  })

  requestStub.yields(null, {}, {})

  const instance = requestUtils.generateCountRequest('/', 'test')

  t.ok(instance)
  t.equal(instance.constructor, Promise)
  t.end()
}))

test('### Should returns error ###', sinon.test(function (t) {
  this.stub(modelUtils, 'resolveKey', (name, key) => {
    return `${key}`
  })
  const error = { message: 'Some error' }

  requestStub.yields(error)

  requestUtils.generateCountRequest('/', 'test')
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.equal(err, error.message)
      t.end()
    })
}))

test('### Should returns error ###', sinon.test(function (t) {
  this.stub(modelUtils, 'resolveKey', (name, key) => {
    return `${key}`
  })

  const body = {
    error: {
      message: 'Some error'
    }
  }
  requestStub.yields(null, null, body)

  requestUtils.generateCountRequest('/', 'test')
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.equal(err, body.error.message)
      t.end()
    })
}))

test('### Stop Arrow ###', function (t) {
  mockery.deregisterMock('request')
  t.end()
})
