'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const distinctMethod = require('../../../../lib/methods/distinct').distinct
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

test('### distinct Call - Error Case ###', function (t) {
  const Model = arrow.getModel('Categories')

  const error = { message: 'Cannot find' }
  const validateError = null
  const field = 'Name'

  const options = { }

  const validateQueryStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return validateError
  })

  const ODataMethods = {
    distinct: (Model, field, options) => {
      return Promise.reject(error)
    }
  }

  const distinctSpy = sinon.spy(ODataMethods, 'distinct')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  distinctMethod.call(connector, Model, field, options, () => {
    t.ok(validateQueryStub.calledOnce)
    t.ok(validateQueryStub.calledWith(options))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(distinctSpy.calledOnce)
    t.ok(distinctSpy.calledWith(Model, field, options))

    validateQueryStub.restore()
    t.end()
  })
})

test('### distinct Call - Error Case with invalid options ###', function (t) {
  const Model = arrow.getModel('Categories')

  const error = { message: 'Invalid options' }
  const options = { }
  const result = { }
  const field = 'Name'

  const validateQueryStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return error
  })

  const ODataMethods = {
    distinct: (Model, field, options) => {
      return Promise.resolve(result)
    }
  }

  const distinctSpy = sinon.spy(ODataMethods, 'distinct')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  distinctMethod.call(connector, Model, field, options, () => {
    t.ok(validateQueryStub.calledOnce)
    t.ok(validateQueryStub.calledWith(options))
    t.notOk(getODataMethodsSpy.calledOnce)
    t.notOk(getODataMethodsSpy.calledWith('Categories'))
    t.notOk(distinctSpy.calledOnce)
    t.notOk(distinctSpy.calledWith(Model, options))

    validateQueryStub.restore()
    t.end()
  })
})

test('### distinct Call - Ok Case ###', function (t) {
  const Model = arrow.getModel('Categories')

  const validateError = null
  const field = 'UnitPrice'
  const result = [12, 14, 22, 5, 10]

  const options = {}

  const validateQueryStub = sinon.stub(validationUtils, 'validateQuery').callsFake((options) => {
    return validateError
  })

  const ODataMethods = {
    distinct: (Model, field, options) => {
      return Promise.resolve(result)
    }
  }

  const distinctSpy = sinon.spy(ODataMethods, 'distinct')

  var getODataMethodsSpy = sinon.spy()
  getODataMethodsStub = function (modelName) {
    getODataMethodsSpy(modelName)
    return ODataMethods
  }

  distinctMethod.call(connector, Model, field, options, () => {
    t.ok(validateQueryStub.calledOnce)
    t.ok(validateQueryStub.calledWith(options))
    t.ok(getODataMethodsSpy.calledOnce)
    t.ok(getODataMethodsSpy.calledWith('Categories'))
    t.ok(distinctSpy.calledOnce)
    t.ok(distinctSpy.calledWith(Model, field, options))

    validateQueryStub.restore()
    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
