'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const deleteAllMethod = require('../../../../lib/methods/deleteAll').deleteAll
const server = require('../../../server')
var arrow
var connector

// Default fn
var getODataMethodsStub = () => { }

test('### Start Arrow ###', function (t) {
  const ODataMock = () => {
    return (modelName) => {
      return getODataMethodsStub(modelName)
    }
  }

  server()
    .then((inst) => {
      arrow = inst
      connector = arrow.getConnector('appc.odata')
      connector.OData = ODataMock()

      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### deleteAll Call - Error Case ###', function (t) {
  const Model = arrow.getModel('Categories')

  const error = { message: 'Cannot delete' }
  const cbErrorSpy = sinon.spy((errorMessage, data) => { })
  const promise = sinon.stub().returnsPromise()
  promise.rejects(error)

  const ODataMethods = {
    deleteAll: (key) => {
      return promise()
    }
  }

  const deleteAllSpy = sinon.spy(ODataMethods, 'deleteAll')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteAllMethod.bind(connector, Model, cbErrorSpy)()

  t.ok(getODataMethodsSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledWith('Categories'))
  t.ok(deleteAllSpy.calledOnce)
  t.ok(deleteAllSpy.calledWith())
  t.ok(cbErrorSpy.calledOnce)

  t.end()
})

test('### deleteAll Call - Ok Case ###', function (t) {
  const Model = arrow.getModel('Categories')

  const result = {
    affectedRows: 5
  }

  const cbOkSpy = sinon.spy((errorMessage, data) => { })
  const promise = sinon.stub().returnsPromise()
  promise.resolves(result)

  const ODataMethods = {
    deleteAll: (key) => {
      return promise()
    }
  }

  const deleteAllSpy = sinon.spy(ODataMethods, 'deleteAll')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteAllMethod.bind(connector, Model, cbOkSpy)()

  t.ok(getODataMethodsSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledWith('Categories'))
  t.ok(deleteAllSpy.calledOnce)
  t.ok(deleteAllSpy.calledWith())
  t.ok(cbOkSpy.calledOnce)
  t.ok(cbOkSpy.calledWith(null, result.affectedRows))

  t.end()
})

test('### deleteAll Call - Ok Case with empty result ###', function (t) {
  const Model = arrow.getModel('Categories')

  const result = { }

  const cbOkSpy = sinon.spy((errorMessage, data) => { })
  const promise = sinon.stub().returnsPromise()
  promise.resolves(result)

  const ODataMethods = {
    deleteAll: (key) => {
      return promise()
    }
  }

  const deleteAllSpy = sinon.spy(ODataMethods, 'deleteAll')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteAllMethod.bind(connector, Model, cbOkSpy)()

  t.ok(getODataMethodsSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledWith('Categories'))
  t.ok(deleteAllSpy.calledOnce)
  t.ok(deleteAllSpy.calledWith())
  t.ok(cbOkSpy.calledOnce)
  t.ok(cbOkSpy.calledWith(null, 0))

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
