'use strict'
const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const findAndModifyMethod = require('../../../../lib/methods/findAndModify').findAndModify
const saveMethod = require('../../../../lib/methods/saveMany').saveMany
const server = require('../../../server')
const modelUtils = require('../../../../utils/modelUtils')
const validationUtils = require('../../../../utils/validationUtils')
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

test('### Not valid options ###', function (t) {
  const error = {
    message: 'Not valid query options'
  }
  const validationUtilsStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return error
  })
  const Model = arrow.getModel('Categories')

  findAndModifyMethod.call(connector, Model, '', '', (err) => {
    t.ok(validationUtilsStub.calledOnce)
    t.deepEquals(err, error)

    validationUtilsStub.restore()
    t.end()
  })
})

test('### Not valid primary key settings (hasPKColumnFalse)### ', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const validationUtilsStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return false
  })
  const hasPKColumnFalse = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return false
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'can\'t find primary key column for Categories' }

  findAndModifyMethod.call(connector, Model, '', '', (err) => {
    t.ok(validationUtilsStub.calledOnce)
    t.ok(validationUtilsStub.calledWith(''))
    t.ok(hasPKColumnFalse.calledOnce)
    t.ok(hasPKColumnFalse.calledWith('Categories'))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.deepEquals(err, error)

    hasPKColumnFalse.restore()
    getNameStub.restore()
    validationUtilsStub.restore()

    t.end()
  })
})

test('### Not valid primary key settings (isPKUpdatedTrue) ### ', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const validationUtilsStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return false
  })
  const isPKUpdatedTrue = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return true
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'primary key column can\'t be specified' }

  findAndModifyMethod.call(connector, Model, '', '', (err) => {
    t.ok(validationUtilsStub.calledOnce)
    t.ok(validationUtilsStub.calledWith(''))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(hasPKColumnStub.calledWith('Categories'))
    t.ok(isPKUpdatedTrue.calledOnce)
    t.deepEquals(err, error)

    validationUtilsStub.restore()
    isPKUpdatedTrue.restore()
    getNameStub.restore()
    hasPKColumnStub.restore()

    t.end()
  })
})

test('### FindAndModify call - Error case ### ', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const validationUtilsStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return false
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'Could not find records' }

  const ODataMethods = {
    query: (Model, options) => {
      return Promise.reject(error)
    }
  }
  const querySpy = sinon.spy(ODataMethods, 'query')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  findAndModifyMethod.call(connector, Model, '', '', (err) => {
    t.ok(validationUtilsStub.calledOnce)
    t.ok(validationUtilsStub.calledWith(''))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(isPKUpdatedStub.calledWith('Categories'))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(hasPKColumnStub.calledWith('Categories'))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(querySpy.calledOnce)
    t.equals(querySpy.firstCall.args[0], Model)
    t.equals(querySpy.firstCall.args[1], '')
    t.equals(err, error)

    validationUtilsStub.restore()
    isPKUpdatedStub.restore()
    getNameStub.restore()
    hasPKColumnStub.restore()
    t.end()
  })
})

test('### FindAndModify call - Ok case (empty result)### ', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const validationUtilsStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return false
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const Model = arrow.getModel('Categories')

  const doc = {
    Name: 'New Name'
  }
  const result = {}

  const ODataMethods = {
    query: (Model, options) => {
      return Promise.resolve(result)
    }
  }
  const querySpy = sinon.spy(ODataMethods, 'query')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  findAndModifyMethod.call(connector, Model, '', doc, (err, arg) => {
    t.ok(validationUtilsStub.calledOnce)
    t.ok(validationUtilsStub.calledWith(''))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(isPKUpdatedStub.calledWith('Categories'))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(hasPKColumnStub.calledWith('Categories'))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(querySpy.calledOnce)
    t.equals(querySpy.firstCall.args[0], Model)
    t.equals(querySpy.firstCall.args[1], '')
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(querySpy.calledOnce)
    t.equals(err, undefined)
    t.equals(arg, undefined)

    validationUtilsStub.restore()
    querySpy.restore()
    getNameStub.restore()
    // getODataMethodsStub.resetHistory()
    isPKUpdatedStub.restore()
    hasPKColumnStub.restore()
    t.end()
  })
})

test('### FindAndModify call - Ok case ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const validationUtilsStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return false
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const Model = arrow.getModel('Categories')

  const doc = {
    Name: 'New Name'
  }
  const result = {
    data: 'data'
  }

  const ODataMethods = {
    query: (Model, options) => {
      return Promise.resolve(result)
    }
  }
  const querySpy = sinon.spy(ODataMethods, 'query')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const saveMethodSpy = sinon.spy()

  const saveMethodStub = sinon.stub(saveMethod, 'call').callsFake((Model, doc, data) => {
    saveMethodSpy(Model, doc, data)
    return Promise.resolve(result)
  })

  findAndModifyMethod.call(connector, Model, '', doc, (err, arg) => {
    t.ok(validationUtilsStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(getNameStub.calledOnce)
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.equals(querySpy.firstCall.args[0], Model)
    t.equals(querySpy.firstCall.args[1], '')
    t.ok(querySpy.calledOnce)
    t.equals(err, null)
    t.equals(arg, result)
    t.ok(saveMethodStub.calledOnce)
    t.equals(saveMethodStub.firstCall.args[0], connector)
    t.equals(saveMethodStub.firstCall.args[1], Model)
    t.equals(saveMethodStub.firstCall.args[2], doc)
    t.equals(saveMethodStub.firstCall.args[3], result.data)
    t.ok(saveMethodSpy.calledOnce)

    validationUtilsStub.restore()
    saveMethodStub.restore()
    getNameStub.restore()
    // getODataMethodsStub.restore()
    isPKUpdatedStub.restore()
    hasPKColumnStub.restore()
    t.end()
  })
})

test('### STOP SERVER ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
