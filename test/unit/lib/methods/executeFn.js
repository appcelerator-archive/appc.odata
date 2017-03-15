'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const executeFn = require('../../../../lib/methods/executeFn').executeFn
const server = require('../../../server')
const modelUtils = require('../../../../utils/modelUtils')
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

test('### ExecuteFn call - Error case ###', function (t) {
  const error = { message: 'Cannot execute' }
  const cbErrorSpy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.rejects(error)

  const ODataMethods = {
    execute: (params) => {
      return promise()
    }
  }
  const executeFnSpy = sinon.spy(ODataMethods, 'execute')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const Model = arrow.getModel('Categories')
  const params = {}
  const options = {
    fn: 'function'
  }
  executeFn.bind(connector, Model, params, options, cbErrorSpy)()
  t.ok(executeFnSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledOnce)
  t.equals(getODataMethodsSpy.firstCall.args[0], options.fn)
  t.ok(cbErrorSpy.calledOnce)
  t.ok(cbErrorSpy.calledWith(error))

  cbErrorSpy.reset()
  getODataMethodsSpy.reset()
  executeFnSpy.reset()
  t.end()
})
test('### ExecuteFn call - Ok case (not returning a collection) ###', function (t) {
  var instance
  const createModelFromPayloadStub = sinon.stub(modelUtils, 'createModelFromPayload', (Model, item) => {
    instance = Model.instance(item, true)
    instance.setPrimaryKey(item.id)

    return instance
  })
  const result = {
    data: {
      id: '58b7f3c8e1674727aaf2ebf0',
      Description: 'Drinks cat. 1',
      Name: 'Cat. 0',
      Products: []
    }
  }
  const cbOkSpy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.resolves(result)

  const ODataMethods = {
    execute: (params) => {
      return promise()
    }
  }
  const executeFnSpy = sinon.spy(ODataMethods, 'execute')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const Model = arrow.getModel('Categories')
  const params = {}
  const options = {
    fn: 'function'
  }
  executeFn.bind(connector, Model, params, options, cbOkSpy)()
  t.ok(executeFnSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledOnce)
  t.equals(getODataMethodsSpy.firstCall.args[0], options.fn)
  t.ok(createModelFromPayloadStub.calledOnce)
  t.equals(createModelFromPayloadStub.firstCall.args[0], Model)
  t.equals(createModelFromPayloadStub.firstCall.args[1], result.data)
  t.ok(cbOkSpy.calledOnce)
  t.equals(cbOkSpy.firstCall.args[0], null)
  t.equals(cbOkSpy.firstCall.args[1], instance)

  cbOkSpy.reset()
  getODataMethodsSpy.reset()
  executeFnSpy.reset()
  t.end()
})

test('### ExecuteFn call - Ok case (returning a collection) ###', function (t) {
  var instance
  const createCollectionFromPayloadStub = sinon.stub(modelUtils, 'createCollectionFromPayload', (Model, item) => {
    instance = Model.instance(item, true)
    instance.setPrimaryKey(item.id)

    return instance
  })
  const result = {
    data: {
      id: '58b7f3c8e1674727aaf2ebf0',
      Description: 'Drinks cat. 1',
      Name: 'Cat. 0',
      Products: []
    }
  }
  const cbOkSpy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.resolves(result)

  const ODataMethods = {
    execute: (params) => {
      return promise()
    }
  }
  const executeFnSpy = sinon.spy(ODataMethods, 'execute')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const Model = arrow.getModel('Categories')
  const params = {}
  const options = {
    returnCollection: true,
    fn: 'function'
  }
  executeFn.bind(connector, Model, params, options, cbOkSpy)()
  t.ok(executeFnSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledOnce)
  t.equals(getODataMethodsSpy.firstCall.args[0], options.fn)
  t.ok(createCollectionFromPayloadStub.calledOnce)
  t.equals(createCollectionFromPayloadStub.firstCall.args[0], Model)
  t.equals(createCollectionFromPayloadStub.firstCall.args[1], result.data)
  t.ok(cbOkSpy.calledOnce)
  t.equals(cbOkSpy.firstCall.args[0], null)
  t.equals(cbOkSpy.firstCall.args[1], instance)

  cbOkSpy.reset()
  getODataMethodsSpy.reset()
  executeFnSpy.reset()
  t.end()
})

test('### ExecuteFn call - Ok case (no Model) ###', function (t) {
  const result = {
    data: {
      id: '58b7f3c8e1674727aaf2ebf0',
      Description: 'Drinks cat. 1',
      Name: 'Cat. 0',
      Products: []
    }
  }
  const cbOkSpy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.resolves(result)

  const ODataMethods = {
    execute: (params) => {
      return promise()
    }
  }
  const executeFnSpy = sinon.spy(ODataMethods, 'execute')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  var Model
  const params = {}
  const options = {
    returnCollection: true,
    fn: 'function'
  }
  executeFn.bind(connector, Model, params, options, cbOkSpy)()
  t.ok(executeFnSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledOnce)
  t.equals(getODataMethodsSpy.firstCall.args[0], options.fn)
  t.ok(cbOkSpy.calledOnce)
  t.equals(cbOkSpy.firstCall.args[0], null)
  t.equals(cbOkSpy.firstCall.args[1], result.data)

  cbOkSpy.reset()
  getODataMethodsSpy.reset()
  executeFnSpy.reset()
  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
