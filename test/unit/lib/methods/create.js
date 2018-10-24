'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const createMethod = require('../../../../lib/methods/create').create
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

test('### Not valid primary key settings (hasPKColumnFalse)### ', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  var hasPKColumnFalse = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return false
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'can\'t find primary key column for Categories' }

  createMethod.call(connector, Model, '', (err) => {
    t.ok(hasPKColumnFalse.calledOnce)
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.deepEquals(err, error)

    hasPKColumnFalse.restore()
    getNameStub.restore()

    t.end()
  })
})

test('### Not valid primary key settings (isPKUpdatedTrue) ### ', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  var isPKUpdatedTrue = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return true
  })
  var hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'primary key column can\'t be specified' }

  createMethod.call(connector, Model, '', (err) => {
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(isPKUpdatedTrue.calledOnce)
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.deepEquals(err, error)

    isPKUpdatedTrue.restore()
    getNameStub.restore()
    hasPKColumnStub.restore()

    t.end()
  })
})

test('### Create Call - Error Case ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  var hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  var isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'Cannot find' }

  const ODataMethods = {
    create: (key) => {
      return Promise.reject(error)
    }
  }
  const createSpy = sinon.spy(ODataMethods, 'create')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  createMethod.call(connector, Model, 'id', (err) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(createSpy.calledOnce)
    t.ok(createSpy.calledWith('id'))
    t.deepEquals(err, error)

    hasPKColumnStub.restore()
    isPKUpdatedStub.restore()
    getNameStub.restore()
    t.end()
  })
})

test('### Create Call - Ok Case ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })

  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })

  const createModelFromPayloadStub = sinon.stub(modelUtils, 'createModelFromPayload').callsFake((Model, data) => {
    return instance
  })

  const Model = arrow.getModel('Categories')

  const result = {
    data: {
      id: '58b7f3c8e1674727aaf2ebf0',
      Description: 'Drinks cat. 1',
      Name: 'Cat. 0',
      Products: []
    }
  }

  const instance = Model.instance(result.data, true)
  instance.setPrimaryKey(result.data.id)

  const ODataMethods = {
    create: (key) => {
      return Promise.resolve(result)
    }
  }
  const createSpy = sinon.spy(ODataMethods, 'create')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  createMethod.call(connector, Model, result.data, (err, arg) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(createSpy.calledOnce)
    t.ok(createSpy.calledWith(result.data))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(createModelFromPayloadStub.calledWith(Model, result.data))
    t.equals(null, err)
    t.deepEquals(arg, instance)

    hasPKColumnStub.restore()
    isPKUpdatedStub.restore()
    getNameStub.restore()
    createModelFromPayloadStub.restore()
    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
