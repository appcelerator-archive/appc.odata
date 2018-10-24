'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const countMethod = require('../../../../lib/methods/count').count
const server = require('../../../server')
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

test('### count Call - Error Case without options ###', function (t) {
  const Model = arrow.getModel('Categories')

  const error = { message: 'Cannot find' }
  const options = {}

  const ODataMethods = {
    count: () => {
      return Promise.reject(error)
    }
  }

  const countSpy = sinon.spy(ODataMethods, 'count')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  countMethod.call(connector, Model, options, (err) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(countSpy.calledOnce)
    t.ok(countSpy.calledWith())
    t.deepEquals(err, error)

    t.end()
  })
})

test('### count Call - Error Case with invalid options ###', function (t) {
  const Model = arrow.getModel('Categories')

  const error = { message: 'Invalid options' }
  const options = {
    limit: '2',
    skip: '3'
  }

  const validateQueryStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return error
  })

  countMethod.call(connector, Model, options, (err) => {
    t.ok(validateQueryStub.calledOnce)
    t.ok(validateQueryStub.calledWith(options))
    t.deepEquals(err, error)

    validateQueryStub.restore()
    t.end()
  })
})

test('### count Call - Error Case with options ###', function (t) {
  const Model = arrow.getModel('Categories')

  const validateError = null
  const error = { message: 'Cannot find' }
  const options = {
    limit: '2',
    skip: '3'
  }

  const validateQueryStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return validateError
  })

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

  countMethod.call(connector, Model, options, (err) => {
    t.ok(validateQueryStub.calledOnce)
    t.ok(validateQueryStub.calledWith(options))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(querySpy.calledOnce)
    t.ok(querySpy.calledWith(Model, options))
    t.deepEquals(err, error)

    validateQueryStub.restore()
    t.end()
  })
})

test('### count Call - OK Case without options ###', function (t) {
  const Model = arrow.getModel('Categories')

  const options = {}
  const result = 23

  const ODataMethods = {
    count: () => {
      return Promise.resolve(result)
    }
  }

  const countSpy = sinon.spy(ODataMethods, 'count')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  countMethod.call(connector, Model, options, (err, arg) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(countSpy.calledOnce)
    t.ok(countSpy.calledWith())
    t.equals(err, null)
    t.equals(arg, result)

    t.end()
  })
})

test('### count Call - Ok Case with options ###', function (t) {
  const Model = arrow.getModel('Categories')

  const error = null
  const options = {
    limit: '2',
    skip: '3'
  }
  const result = {
    data: [
      {
        id: '58b7f3c8e1674727aaf2ebf0',
        Description: 'Drinks cat. 1',
        Name: 'Cat. 0',
        Products: []
      },
      {
        id: '68b7f3c8e1674727aaf2ebf0',
        Description: 'Drinks cat. 2',
        Name: 'Cat. 1',
        Products: []
      }
    ]
  }

  const validateQueryStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return error
  })

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

  countMethod.call(connector, Model, options, (err, arg) => {
    t.ok(validateQueryStub.calledOnce)
    t.ok(validateQueryStub.calledWith(options))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(querySpy.calledOnce)
    t.ok(querySpy.calledWith(Model, options))
    t.equals(err, null)
    t.equals(arg, result.data.length)

    validateQueryStub.restore()
    t.end()
  })
})

test('### count Call - Ok Case with options and without data ###', function (t) {
  const Model = arrow.getModel('Categories')

  const error = null
  const result = {}
  const options = {
    limit: '2',
    skip: '3'
  }

  const validateQueryStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return error
  })

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

  countMethod.call(connector, Model, options, (err, arg) => {
    t.ok(validateQueryStub.calledOnce)
    t.ok(validateQueryStub.calledWith(options))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(querySpy.calledOnce)
    t.ok(querySpy.calledWith(Model, options))
    t.equals(err, null)
    t.equals(arg, 0)

    validateQueryStub.restore()
    t.end()
  })
})

test('### count Call - Ok Case with string where ###', function (t) {
  const Model = arrow.getModel('Categories')

  const options = {
    limit: '2',
    skip: '3',
    where: '{"Description":{"$eq":"Drinks cat."}}'
  }
  const result = {
    data: [
      {
        id: '58b7f3c8e1674727aaf2ebf0',
        Description: 'Drinks cat. 1',
        Name: 'Cat. 0',
        Products: []
      },
      {
        id: '68b7f3c8e1674727aaf2ebf0',
        Description: 'Drinks cat. 2',
        Name: 'Cat. 1',
        Products: []
      }
    ]
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

  countMethod.call(connector, Model, options, (err, arg) => {
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(querySpy.calledOnce)
    t.ok(querySpy.calledWith(Model, options))
    t.equals(err, null)
    t.equals(arg, result.data.length)

    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
