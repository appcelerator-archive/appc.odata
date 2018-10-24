'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const deleteByIdMethod = require('../../../../lib/methods/delete')['delete']
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

test('### deleteByID Call - Error Case ###', t => {
  const Model = arrow.getModel('Categories')

  const error = { message: 'Cannot delete' }

  const instance = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  const ODataMethods = {
    deleteOne: (key) => {
      return Promise.reject(error)
    }
  }

  const deleteByIDSpy = sinon.spy(ODataMethods, 'deleteOne')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteByIdMethod.call(connector, Model, instance, () => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(deleteByIDSpy.calledOnce)
    t.ok(deleteByIDSpy.calledWith(instance.id))

    t.end()
  })
})

test('### deleteByID Call - Ok Case ###', t => {
  const Model = arrow.getModel('Categories')

  const result = {
    affectedRows: 1
  }

  const instance = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  const ODataMethods = {
    deleteOne: (key) => {
      return Promise.resolve(result)
    }
  }

  const deleteByIDSpy = sinon.spy(ODataMethods, 'deleteOne')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteByIdMethod.call(connector, Model, instance, () => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(deleteByIDSpy.calledOnce)
    t.ok(deleteByIDSpy.calledWith(instance.id))

    t.end()
  })
})

test('### deleteByID Call Call - Ok Case with empty result ###', t => {
  const Model = arrow.getModel('Categories')

  const result = {
    affectedRows: 0
  }

  const instance = {
    id: '58b7f3c8e1674727aaf2ebf0',
    Description: 'Drinks cat. 1',
    Name: 'Cat. 0',
    Products: []
  }

  const ODataMethods = {
    deleteOne: (key) => {
      return Promise.resolve(result)
    }
  }

  const deleteByIDSpy = sinon.spy(ODataMethods, 'deleteOne')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  deleteByIdMethod.call(connector, Model, instance, () => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(deleteByIDSpy.calledOnce)
    t.ok(deleteByIDSpy.calledWith(instance.id))

    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
