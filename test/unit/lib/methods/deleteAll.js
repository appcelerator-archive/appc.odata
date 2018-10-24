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

  const ODataMethods = {
    deleteAll: (key) => {
      return Promise.reject(error)
    }
  }

  const deleteAllSpy = sinon.spy(ODataMethods, 'deleteAll')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteAllMethod.call(connector, Model, () => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(deleteAllSpy.calledOnce)
    t.ok(deleteAllSpy.calledWith())

    t.end()
  })
  /*
  deleteAllMethod.bind(connector, Model, cbErrorSpy)()

  t.ok(getODataMethodsSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledWith('Categories'))
  t.ok(deleteAllSpy.calledOnce)
  t.ok(deleteAllSpy.calledWith())
  t.ok(cbErrorSpy.calledOnce)

  t.end()
  */
})

test('### deleteAll Call - Ok Case ###', function (t) {
  const Model = arrow.getModel('Categories')

  const result = {
    affectedRows: 5
  }

  const ODataMethods = {
    deleteAll: (key) => {
      return Promise.resolve(result)
    }
  }

  const deleteAllSpy = sinon.spy(ODataMethods, 'deleteAll')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteAllMethod.call(connector, Model, () => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(deleteAllSpy.calledOnce)
    t.ok(deleteAllSpy.calledWith())

    t.end()
  })
})

test('### deleteAll Call - Ok Case with empty result ###', function (t) {
  const Model = arrow.getModel('Categories')

  const result = { }

  const ODataMethods = {
    deleteAll: (key) => {
      return Promise.resolve(result)
    }
  }

  const deleteAllSpy = sinon.spy(ODataMethods, 'deleteAll')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteAllMethod.call(connector, Model, () => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(deleteAllSpy.calledOnce)
    t.ok(deleteAllSpy.calledWith())

    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
