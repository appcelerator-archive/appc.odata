'use strict'
const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const upsertMethod = require('../../../../lib/methods/upsert').upsert
const createMany = require('../../../../lib/methods/createMany').createMany
const saveMany = require('../../../../lib/methods/saveMany').saveMany
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
  const hasPKColumnFalse = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return false
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'can\'t find primary key column for Categories' }

  upsertMethod.call(connector, Model, '', '', (err) => {
    t.ok(hasPKColumnFalse.calledOnce)
    t.ok(hasPKColumnFalse.calledWith('Categories'))
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.deepEquals(err, error)

    getNameStub.restore()
    hasPKColumnFalse.restore()

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

  const error = { message: 'primary key column can\'t be updated' }

  upsertMethod.call(connector, Model, '', '', (err) => {
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(hasPKColumnStub.calledWith('Categories'))
    t.ok(isPKUpdatedTrue.calledWith('Categories'))
    t.ok(isPKUpdatedTrue.calledOnce)
    t.ok(getNameStub.calledOnce)
    t.ok(getNameStub.calledWith(Model))
    t.deepEquals(err, error)

    getNameStub.restore()
    isPKUpdatedTrue.restore()
    hasPKColumnStub.restore()

    t.end()
  })
})

test('### Upsert Method - Error case (without id) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })

  const error = { message: 'Cannot find' }

  const createMethodSpy = sinon.spy()

  const createMethodStub = sinon.stub(createMany, 'call').callsFake((Model, doc, data) => {
    createMethodSpy(Model, doc, data)
    return Promise.reject(error)
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  var id

  upsertMethod.call(connector, Model, id, doc, (err) => {
    t.ok(getNameStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(createMethodStub.calledOnce)
    t.ok(createMethodSpy.calledOnce)
    t.ok(createMethodSpy.firstCall.args[0], connector)
    t.ok(createMethodSpy.firstCall.args[1], Model)
    t.ok(createMethodSpy.firstCall.args[2], doc)
    t.deepEquals(err, error)

    getNameStub.restore()
    isPKUpdatedStub.restore()
    hasPKColumnStub.restore()
    createMethodStub.restore()
    createMethodSpy.resetHistory()

    t.end()
  })
})

test('### Upsert Method - Ok case (without id) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })

  const result = ['result']
  const createMethodSpy = sinon.spy()

  const createMethodStub = sinon.stub(createMany, 'call').callsFake((Model, doc, data) => {
    createMethodSpy(Model, doc, data)
    return Promise.resolve(result)
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  var id

  upsertMethod.call(connector, Model, id, doc, (err, arg) => {
    t.ok(getNameStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(createMethodStub.calledOnce)
    t.ok(createMethodSpy.calledOnce)
    t.ok(createMethodSpy.firstCall.args[0], connector)
    t.ok(createMethodSpy.firstCall.args[1], Model)
    t.ok(createMethodSpy.firstCall.args[2], doc)
    t.equals(err, null)
    t.equals(arg, result[0])

    getNameStub.restore()
    isPKUpdatedStub.restore()
    hasPKColumnStub.restore()
    createMethodStub.restore()
    createMethodSpy.resetHistory()
    t.end()
  })
})

test('### Upsert Method - Error case (with id) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const error = { message: 'Cannot find' }

  const ODataMethods = {
    findByID: (key) => {
      return Promise.reject(error)
    }
  }
  const findByIDSpy = sinon.spy(ODataMethods, 'findByID')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  upsertMethod.call(connector, Model, doc.id, doc, (err) => {
    t.ok(getNameStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(findByIDSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
    t.deepEquals(err, error)

    getNameStub.restore()
    isPKUpdatedStub.restore()
    hasPKColumnStub.restore()
    findByIDSpy.restore()

    t.end()
  })
})

test('### Upsert Method - Ok case (with id and no result.data) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const error = { message: 'Cannot find' }

  const ODataMethods = {
    findByID: (key) => {
      return Promise.resolve(error)
    }
  }
  const findByIDSpy = sinon.spy(ODataMethods, 'findByID')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const createMethodSpy = sinon.spy()
  const result = ['result']

  const createMethodStub = sinon.stub(createMany, 'call').callsFake((Model, doc, data) => {
    createMethodSpy(Model, doc, data)
    return Promise.resolve(result)
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  upsertMethod.call(connector, Model, doc.id, doc, (err, arg) => {
    t.ok(getNameStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(findByIDSpy.calledOnce)
    t.ok(createMethodStub.calledOnce)
    t.ok(createMethodStub.calledWith(connector, Model, [doc]))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
    t.equals(err, null)
    t.equals(arg, result[0])

    getNameStub.restore()
    isPKUpdatedStub.restore()
    hasPKColumnStub.restore()
    findByIDSpy.restore()

    t.end()
  })
})

test('### Upsert Method - Ok case (with id and result.data) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName').callsFake((Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated').callsFake((modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn').callsFake((modelName) => {
    return true
  })
  const resultData = { data: 'Cannot find' }

  const ODataMethods = {
    findByID: (key) => {
      return Promise.resolve(resultData)
    }
  }
  const findByIDSpy = sinon.spy(ODataMethods, 'findByID')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const saveManySpy = sinon.spy()
  const result = ['result']

  const saveManyStub = sinon.stub(saveMany, 'call').callsFake((Model, doc, data) => {
    saveManySpy(Model, doc, data)
    return Promise.resolve(result)
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  upsertMethod.call(connector, Model, doc.id, doc, (err, arg) => {
    t.ok(getNameStub.calledOnce)
    t.ok(isPKUpdatedStub.calledOnce)
    t.ok(hasPKColumnStub.calledOnce)
    t.ok(findByIDSpy.calledOnce)
    t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
    t.ok(saveManyStub.calledOnce)
    t.ok(saveManyStub.calledWith(connector, Model, doc, [resultData.data]))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.equals(err, null)
    t.equals(arg, result[0])

    getNameStub.restore()
    isPKUpdatedStub.restore()
    hasPKColumnStub.restore()
    findByIDSpy.restore()

    t.end()
  })
})

test('### STOP SERVER ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
