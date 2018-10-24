'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const saveMethod = require('../../../../lib/methods/save').save
const server = require('../../../server')
const modelUtils = require('../../../../utils/modelUtils')
var arrow
var connector
var instance

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

test('### Save Call - incorrect primary key settings(hasPKColumn) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const hasPKColumnFalse = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return false
  })

  const Model = arrow.getModel('Categories')
  const error = {
    message: 'can\'t find primary key column for Categories'
  }

  saveMethod.call(connector, Model, instance, (err) => {
    t.ok(hasPKColumnFalse.calledOnce)
    t.ok(hasPKColumnFalse.calledWith('Categories'))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.deepEquals(err, error)

    hasPKColumnFalse.restore()
    getNameStub.restore()
    t.end()
  })
})

test('### Save Call - incorrect primary key settings(isPKUpdated) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const isPKUpdatedTrueStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return true
  })

  const Model = arrow.getModel('Categories')
  const error = {
    message: 'primary key column can\'t be updated'
  }

  saveMethod.call(connector, Model, instance, (err) => {
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(isPKUpdatedTrueStub.calledOnce)
    t.ok(isPKUpdatedTrueStub.calledWith('Categories'))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(isPKUpdatedTrueStub.calledWith('Categories'))
    t.deepEquals(err, error)

    isPKUpdatedTrueStub.restore()
    hasPKColumnStub.restore()
    getNameStub.restore()
    t.end()
  })
})

test('### Save Call - Error Case ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })

  // create instance
  const data = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  const Model = arrow.getModel('Categories')
  const instance = Model.instance(data, true)
  instance.setPrimaryKey(data.id)

  const error = { message: 'Cannot find' }

  const ODataMethods = {
    update: (key, doc, item) => {
      return Promise.reject(error)
    }
  }
  const saveSpy = sinon.spy(ODataMethods, 'update')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  saveMethod.call(connector, Model, instance, (err) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(saveSpy.calledOnce)
    t.ok(saveSpy.calledWith(data.id, instance.getChangedFields(), instance.toJSON()))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(hasPKColumnStub.calledWith('Categories'))
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(isPKUpdatedStub.calledWith('Categories'))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.equals(err, error)

    hasPKColumnStub.restore()
    isPKUpdatedStub.restore()
    getNameStub.restore()
    t.end()
  })
})

test('### Save Call - Ok Case ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })

  // create instance
  const data = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  const Model = arrow.getModel('Categories')
  const instance = Model.instance(data, true)
  instance.setPrimaryKey(data.id)

  const result = { affectedRows: 1 }

  const ODataMethods = {
    update: (key) => {
      return Promise.resolve(result)
    }
  }
  const saveSpy = sinon.spy(ODataMethods, 'update')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  saveMethod.call(connector, Model, instance, (err, arg) => {
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(isPKUpdatedStub.calledWith('Categories'))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(hasPKColumnStub.calledWith('Categories'))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(saveSpy.calledOnce)
    t.ok(saveSpy.calledWith(data.id, instance.getChangedFields(), instance.toJSON()))
    t.equals(err, null)
    t.equals(arg, instance)

    hasPKColumnStub.restore()
    isPKUpdatedStub.restore()
    getNameStub.restore()
    t.end()
  })
})

test('### Save Call - Ok Case with empty response ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })

  // create instance
  const data = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  const Model = arrow.getModel('Categories')
  const instance = Model.instance(data, true)
  instance.setPrimaryKey(data.id)

  const result = {}

  const ODataMethods = {
    update: (key) => {
      return Promise.resolve(result)
    }
  }
  const saveSpy = sinon.spy(ODataMethods, 'update')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  saveMethod.call(connector, Model, instance, (err, arg) => {
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(isPKUpdatedStub.calledWith('Categories'))
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(hasPKColumnStub.calledWith('Categories'))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(saveSpy.calledOnce)
    t.ok(saveSpy.calledWith(data.id, instance.getChangedFields(), instance.toJSON()))
    t.equals(err, undefined)
    t.equals(arg, undefined)

    hasPKColumnStub.restore()
    isPKUpdatedStub.restore()
    getNameStub.restore()
    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
