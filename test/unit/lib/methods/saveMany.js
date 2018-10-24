'use strict'
const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const saveManyMethod = require('../../../../lib/methods/saveMany').saveMany
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

test('## Save Many - Error case', function (t) {
  const Model = arrow.getModel('Categories')

  const error = 'Cannot find'

  const ODataMethods = {
    update: (key, changedFields, payload) => {
      return Promise.reject(error)
    }
  }

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }
  var doc
  const saveManySpy = sinon.spy(ODataMethods, 'update')
  saveManyMethod.call(connector, Model, doc, result.data)
    .then((data) => {
      console.log(data)
    })
    .catch((err) => {
      t.equals(err, error)
      t.ok(saveManySpy.calledOnce)
      t.ok(getODataMethodsSpy.calledOnce)

      t.end()
    })
})

test('## Save Many - Ok case', function (t) {
  const result = {
    affectedRows: 1
  }
  const data = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }
  const doc = {
    Name: 'New Name'
  }
  const newData = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'New Name',
    Products: []
  }

  var createCollectionFromPayloadStub = sinon.stub(modelUtils, 'createCollectionFromPayload').callsFake((Model, item) => {
    var instance = Model.instance(item, true)
    instance.setPrimaryKey(item.id)
    return instance
  })
  const Model = arrow.getModel('Categories')

  const ODataMethods = {
    update: (key, changedFields, payload) => {
      return Promise.resolve(result)
    }
  }

  const saveManySpy = sinon.spy(ODataMethods, 'update')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }
  saveManyMethod.call(connector, Model, doc, [data])
    .then((inst) => {
      t.ok(createCollectionFromPayloadStub.calledOnce)
      t.ok(saveManySpy.calledOnce)
      t.equals(saveManySpy.firstCall.args[0], '58b7f3c8e1674727aaf2ebf0')
      t.equals(saveManySpy.firstCall.args[1], doc)
      t.deepequal(saveManySpy.firstCall.args[2], newData)

      t.equals(createCollectionFromPayloadStub.firstCall.args[0], Model)
      t.deepequal(createCollectionFromPayloadStub.firstCall.args[1], [newData])
      t.ok(getODataMethodsSpy.calledOnce)

      createCollectionFromPayloadStub.restore()
      getODataMethodsSpy.resetHistory()

      t.end()
    })
    .catch((err) => {
      console.log(err)
    })
})

test('## Save Many - Empty responce', function (t) {
  const result = {}
  const data = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }
  const doc = {
    Name: 'New Name'
  }

  var createCollectionFromPayloadStub = sinon.stub(modelUtils, 'createCollectionFromPayload').callsFake((Model, results) => {
    var instance = Model.instance(results, true)
    instance.setPrimaryKey(results.id)
    return instance
  })
  const Model = arrow.getModel('Categories')

  const ODataMethods = {
    update: (key, changedFields, payload) => {
      return Promise.resolve(result)
    }
  }

  const saveManySpy = sinon.spy(ODataMethods, 'update')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function () {
    getODataMethodsSpy()
    return ODataMethods
  }
  saveManyMethod.call(connector, Model, doc, [data])
    .then((inst) => {
      t.ok(createCollectionFromPayloadStub.calledOnce)
      t.ok(saveManySpy.calledOnce)

      t.equal(createCollectionFromPayloadStub.firstCall.args[0], Model)
      t.deepequal(createCollectionFromPayloadStub.firstCall.args[1], [undefined])
      t.ok(getODataMethodsSpy.calledOnce)

      createCollectionFromPayloadStub.restore()
      getODataMethodsSpy.resetHistory()

      t.end()
    })
})

test('### STOP SERVER ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
