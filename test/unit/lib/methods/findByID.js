'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const findByIdMethod = require('../../../../lib/methods/findByID').findByID
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

test('### findById Call - Error Case ###', function (t) {
  const Model = arrow.getModel('Categories')

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

  findByIdMethod.call(connector, Model, '58b7f3c8e1674727aaf2ebf0', (err) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(findByIDSpy.calledOnce)
    t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
    t.deepEquals(err, error.message)

    t.end()
  })
})

test('### findById Call - Ok Case ###', function (t) {
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
  instance.setPrimaryKey('58b7f3c8e1674727aaf2ebf0')

  const modelUtilsStub = sinon.stub(modelUtils, 'createModelFromPayload').callsFake((Model, item) => {
    return instance
  })

  const ODataMethods = {
    findByID: (key) => {
      return Promise.resolve(result)
    }
  }
  const findByIDSpy = sinon.spy(ODataMethods, 'findByID')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  findByIdMethod.call(connector, Model, '58b7f3c8e1674727aaf2ebf0', (err, arg) => {
    t.equal(modelUtilsStub.firstCall.args[0], Model)
    t.equal(modelUtilsStub.firstCall.args[1], result.data)
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(findByIDSpy.calledOnce)
    t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
    t.ok(modelUtilsStub.calledOnce)
    t.equals(err, null)
    t.equals(arg, instance)

    modelUtilsStub.restore()
    t.end()
  })
})

test('### findById Call - Ok Case with empty callback ###', function (t) {
  const Model = arrow.getModel('Categories')

  const result = {
    data: null
  }

  const ODataMethods = {
    findByID: (key) => {
      return Promise.resolve(result)
    }
  }
  const findByIDSpy = sinon.spy(ODataMethods, 'findByID')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  findByIdMethod.call(connector, Model, '58b7f3c8e1674727aaf2ebf0', (err, arg) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(findByIDSpy.calledOnce)
    t.ok(findByIDSpy.calledWith('58b7f3c8e1674727aaf2ebf0'))
    t.equals(err, undefined)
    t.equals(arg, undefined)

    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
