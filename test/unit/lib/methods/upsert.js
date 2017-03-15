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
  const getNameStub = sinon.stub(modelUtils, 'getName', (Model) => {
    return 'Categories'
  })
  const hasPKColumnFalse = sinon.stub(modelUtils, 'hasPKColumn', (modelName) => {
    return false
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'can\'t find primary key column for Categories' }
  const cbErrorSpy = sinon.spy()

  upsertMethod.bind(connector, Model, '', '', cbErrorSpy)()
  t.ok(hasPKColumnFalse.calledOnce)
  t.ok(hasPKColumnFalse.calledWith('Categories'))
  t.ok(getNameStub.calledOnce)
  t.ok(getNameStub.calledWith(Model))
  t.ok(cbErrorSpy.calledWith(error))
  t.ok(cbErrorSpy.calledOnce)

  getNameStub.restore()
  hasPKColumnFalse.restore()
  cbErrorSpy.reset()

  t.end()
})

test('### Not valid primary key settings (isPKUpdatedTrue) ### ', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName', (Model) => {
    return 'Categories'
  })
  var isPKUpdatedTrue = sinon.stub(modelUtils, 'isPKUpdated', (modelName, values) => {
    return true
  })
  var hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn', (modelName) => {
    return true
  })
  const Model = arrow.getModel('Categories')

  const error = { message: 'primary key column can\'t be updated' }
  const cbErrorSpy = sinon.spy()

  upsertMethod.bind(connector, Model, '', '', cbErrorSpy)()
  t.ok(hasPKColumnStub.calledOnce)
  t.ok(hasPKColumnStub.calledWith('Categories'))
  t.ok(isPKUpdatedTrue.calledWith('Categories'))
  t.ok(isPKUpdatedTrue.calledOnce)
  t.ok(getNameStub.calledOnce)
  t.ok(getNameStub.calledWith(Model))
  t.ok(cbErrorSpy.calledWith(error))
  t.ok(cbErrorSpy.calledOnce)

  getNameStub.restore()
  isPKUpdatedTrue.restore()
  cbErrorSpy.reset()
  hasPKColumnStub.restore()

  t.end()
})

test('### Upsert Method - Error case (without id) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName', (Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated', (modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn', (modelName) => {
    return true
  })

  const error = { message: 'Cannot find' }
  const cbErrorspy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.rejects(error)

  const promiseSave = sinon.stub().returnsPromise()
  promiseSave.rejects('result')

  const createMethodSpy = sinon.spy()

  const createMethodStub = sinon.stub(createMany, 'call', (Model, doc, data) => {
    createMethodSpy(Model, doc, data)
    return promiseSave()
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  var id

  upsertMethod.bind(connector, Model, id, doc, cbErrorspy)()
  t.ok(getNameStub.calledOnce)
  t.ok(isPKUpdatedStub.calledOnce)
  t.ok(hasPKColumnStub.calledOnce)
  t.ok(createMethodStub.calledOnce)
  t.ok(createMethodSpy.calledOnce)
  t.ok(createMethodSpy.firstCall.args[0], connector)
  t.ok(createMethodSpy.firstCall.args[1], Model)
  t.ok(createMethodSpy.firstCall.args[2], doc)
  t.ok(cbErrorspy.calledOnce)
  t.ok(cbErrorspy.calledWith('result'))

  getNameStub.restore()
  isPKUpdatedStub.restore()
  hasPKColumnStub.restore()
  createMethodStub.restore()
  createMethodSpy.reset()
  cbErrorspy.reset()

  t.end()
})

test('### Upsert Method - Ok case (without id) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName', (Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated', (modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn', (modelName) => {
    return true
  })

  const error = { message: 'Cannot find' }
  const cbOkspy = sinon.spy()
  const promise = sinon.stub().returnsPromise()
  promise.rejects(error)

  const promiseSave = sinon.stub().returnsPromise()
  promiseSave.resolves(['result'])

  const createMethodSpy = sinon.spy()

  const createMethodStub = sinon.stub(createMany, 'call', (Model, doc, data) => {
    createMethodSpy(Model, doc, data)
    return promiseSave()
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  var id

  upsertMethod.bind(connector, Model, id, doc, cbOkspy)()
  t.ok(getNameStub.calledOnce)
  t.ok(isPKUpdatedStub.calledOnce)
  t.ok(hasPKColumnStub.calledOnce)
  t.ok(createMethodStub.calledOnce)
  t.ok(createMethodSpy.calledOnce)
  t.ok(createMethodSpy.firstCall.args[0], connector)
  t.ok(createMethodSpy.firstCall.args[1], Model)
  t.ok(createMethodSpy.firstCall.args[2], doc)
  t.ok(cbOkspy.calledOnce)
  t.ok(cbOkspy.calledWith(null, 'result'))

  getNameStub.restore()
  isPKUpdatedStub.restore()
  hasPKColumnStub.restore()
  createMethodStub.restore()
  createMethodSpy.reset()
  cbOkspy.reset()
  t.end()
})

test('### Upsert Method - Error case (with id) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName', (Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated', (modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn', (modelName) => {
    return true
  })
  const cbErrorSpy = sinon.spy()
  const error = { message: 'Cannot find' }
  const promise = sinon.stub().returnsPromise()
  promise.rejects(error)

  const ODataMethods = {
    findByID: (key) => {
      return promise()
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

  upsertMethod.bind(connector, Model, doc.id, doc, cbErrorSpy)()
  t.ok(getNameStub.calledOnce)
  t.ok(isPKUpdatedStub.calledOnce)
  t.ok(hasPKColumnStub.calledOnce)
  t.ok(findByIDSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledWith('Categories'))
  t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
  t.ok(cbErrorSpy.calledOnce)
  t.ok(cbErrorSpy.calledWith(error))

  getNameStub.restore()
  isPKUpdatedStub.restore()
  hasPKColumnStub.restore()
  findByIDSpy.restore()
  cbErrorSpy.reset()

  t.end()
})

test('### Upsert Method - Ok case (with id and no result.data) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName', (Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated', (modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn', (modelName) => {
    return true
  })
  const cbOkspy = sinon.spy()
  const error = { message: 'Cannot find' }
  const promise = sinon.stub().returnsPromise()
  promise.resolves(error)

  const ODataMethods = {
    findByID: (key) => {
      return promise()
    }
  }
  const findByIDSpy = sinon.spy(ODataMethods, 'findByID')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const createMethodSpy = sinon.spy()

  const promiseSave = sinon.stub().returnsPromise()
  promiseSave.resolves(['result'])

  const createMethodStub = sinon.stub(createMany, 'call', (Model, doc, data) => {
    createMethodSpy(Model, doc, data)
    return promiseSave()
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  upsertMethod.bind(connector, Model, doc.id, doc, cbOkspy)()
  t.ok(getNameStub.calledOnce)
  t.ok(isPKUpdatedStub.calledOnce)
  t.ok(hasPKColumnStub.calledOnce)
  t.ok(findByIDSpy.calledOnce)
  t.ok(createMethodStub.calledOnce)
  t.ok(createMethodStub.calledWith(connector, Model, [doc]))
  t.ok(getODataMethodsSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledWith('Categories'))
  t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
  t.ok(cbOkspy.calledOnce)
  t.ok(cbOkspy.calledWith(null, 'result'))

  getNameStub.restore()
  isPKUpdatedStub.restore()
  hasPKColumnStub.restore()
  findByIDSpy.restore()
  cbOkspy.reset()

  t.end()
})

test('### Upsert Method - Ok case (with id and result.data) ###', function (t) {
  const getNameStub = sinon.stub(modelUtils, 'getName', (Model) => {
    return 'Categories'
  })
  const isPKUpdatedStub = sinon.stub(modelUtils, 'isPKUpdated', (modelName, values) => {
    return false
  })
  const hasPKColumnStub = sinon.stub(modelUtils, 'hasPKColumn', (modelName) => {
    return true
  })
  const cbOkspy = sinon.spy()
  const error = { data: 'Cannot find' }
  const promise = sinon.stub().returnsPromise()
  promise.resolves(error)

  const ODataMethods = {
    findByID: (key) => {
      return promise()
    }
  }
  const findByIDSpy = sinon.spy(ODataMethods, 'findByID')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  const saveManySpy = sinon.spy()

  const promiseSave = sinon.stub().returnsPromise()
  promiseSave.resolves(['result'])

  const saveManyStub = sinon.stub(saveMany, 'call', (Model, doc, data) => {
    saveManySpy(Model, doc, data)
    return promiseSave()
  })

  const Model = arrow.getModel('Categories')
  const doc = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  upsertMethod.bind(connector, Model, doc.id, doc, cbOkspy)()
  t.ok(getNameStub.calledOnce)
  t.ok(isPKUpdatedStub.calledOnce)
  t.ok(hasPKColumnStub.calledOnce)
  t.ok(findByIDSpy.calledOnce)
  t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
  t.ok(saveManyStub.calledOnce)
  t.ok(saveManyStub.calledWith(connector, Model, doc, [error.data]))
  t.ok(getODataMethodsSpy.calledOnce)
  t.ok(getODataMethodsSpy.calledWith('Categories'))
  t.ok(cbOkspy.calledOnce)
  t.ok(cbOkspy.calledWith(null, 'result'))

  getNameStub.restore()
  isPKUpdatedStub.restore()
  hasPKColumnStub.restore()
  findByIDSpy.restore()
  cbOkspy.reset()

  t.end()
})

test('### STOP SERVER ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
