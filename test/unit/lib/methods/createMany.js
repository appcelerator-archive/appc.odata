'use strict'
const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const createManyMethod = require('../../../../lib/methods/createMany').createMany
const server = require('../../../server')
const modelUtils = require('../../../../utils/modelUtils')
var arrow
var connector

const result = {
  data: [{
    id: '58bd59c665680d17f24aee47',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 2'
  }]
}

const data = {
  id: '58bd59c665680d17f24aee47',
  Description: 'Drinks cat. 1',
  Name: 'Cat. 2'
}

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

test('## Create Many - Error case', function (t) {
  const Model = arrow.getModel('Categories')

  const error = 'Cannot find'
  const promise = sinon.stub().returnsPromise()
  promise.rejects(error)

  const ODataMethods = {
    create: (data) => {
      return promise()
    }
  }

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const createManySpy = sinon.spy(ODataMethods, 'create')
  createManyMethod.call(connector, Model, result.data)
    .then((data) => {
      console.log(data)
    })
    .catch((err) => {
      t.equals(err, error)
      t.ok(createManySpy.calledOnce)
      t.ok(createManySpy.calledWith(data))
      t.ok(getODataMethodsSpy.calledOnce)
      t.ok(getODataMethodsSpy.calledWith('Categories'))
      t.end()
    })
})

test('## Create Many - Ok case', function (t) {
  var createCollectionFromPayloadStub = sinon.stub(modelUtils, 'createCollectionFromPayload', (Model, items) => {
    var instance = Model.instance(result.data, true)
    instance.setPrimaryKey(result.data.id)
    return instance
  })
  const Model = arrow.getModel('Categories')

  // const cbErrorSpy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.resolves(result)

  const ODataMethods = {
    create: (data) => {
      return promise()
    }
  }

  const createManySpy = sinon.spy(ODataMethods, 'create')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function () {
    getODataMethodsSpy()
    return ODataMethods
  }
  createManyMethod.call(connector, Model, result.data)
    .then((inst) => {
      t.ok(createCollectionFromPayloadStub.calledOnce)
      t.ok(createManySpy.calledOnce)
      t.ok(createManySpy.calledWith(data))

      t.equal(createCollectionFromPayloadStub.firstCall.args[0], Model)
      t.equal(createCollectionFromPayloadStub.firstCall.args[1][0], result.data)
      t.ok(getODataMethodsSpy.calledOnce)

      createCollectionFromPayloadStub.restore()
      getODataMethodsSpy.reset()

      t.end()
    })
})

test('## Create Many - Empty responce', function (t) {
  const result = {}
  const data = [{
    id: '58bd59c665680d17f24aee47',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 2'
  }]
  var createCollectionFromPayloadStub = sinon.stub(modelUtils, 'createCollectionFromPayload', (Model, items) => {
    var instance = Model.instance(data, true)
    instance.setPrimaryKey(data.id)
    return instance
  })
  const Model = arrow.getModel('Categories')

  // const cbErrorSpy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.resolves(result)

  const ODataMethods = {
    create: (data) => {
      return promise()
    }
  }

  const createManySpy = sinon.spy(ODataMethods, 'create')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function () {
    getODataMethodsSpy()
    return ODataMethods
  }
  createManyMethod.call(connector, Model, data)
    .then((inst) => {
      t.ok(createCollectionFromPayloadStub.calledOnce)
      t.ok(createManySpy.calledOnce)

      t.equal(createCollectionFromPayloadStub.firstCall.args[0], Model)
      t.equal(createCollectionFromPayloadStub.firstCall.args[1][0], undefined)
      t.ok(getODataMethodsSpy.calledOnce)

      createCollectionFromPayloadStub.restore()
      getODataMethodsSpy.reset()

      t.end()
    })
})

test('### STOP SERVER ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
