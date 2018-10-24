'use strict'

const test = require('tap').test
const sinon = require('sinon')
const mockery = require('mockery')
// const Arrow = require('arrow')

// Init mockery
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
})

const createModelsSpy = sinon.spy()
const utilsMock = () => {
  return {
    createModels: createModelsSpy
  }
}

// const arrowGlobalMock = {
//   app: {},
//   apis: []
// }

const schemaModelsTransformerMock = sinon.stub()
// const schemaEndpointsTransformerMock = sinon.stub()

mockery.registerMock('../../utils/schemaModelsTransformer', schemaModelsTransformerMock)
// mockery.registerMock('../../utils/schemaEndpointsTransformer', schemaEndpointsTransformerMock)
mockery.registerMock('appc-connector-utils', utilsMock)

const createModelsFromSchema = require('../../../../lib/schema/createModelsFromSchema').createModelsFromSchema

test('### Should create models and endpoints from schema ###', function (t) {
  // const arrowGetGlobalSpy = sinon.spy()
  // const arrowGetGlobalStub = sinon.stub(Arrow, 'getGlobal', () => {
  //   arrowGetGlobalSpy()

  //   return arrowGlobalMock
  // })
  // const arrowAPIExtendStub = sinon.stub(Arrow.API, 'extend').returns(() => { })

  schemaModelsTransformerMock.returns({})
  // schemaEndpointsTransformerMock.returns([{}])

  // Test call
  createModelsFromSchema.call({ schema: null })

  t.ok(createModelsSpy.calledOnce)
  t.ok(schemaModelsTransformerMock.calledOnce)
  // t.ok(arrowGetGlobalSpy.calledOnce)

  // setImmediate(() => {
  //   t.ok(arrowAPIExtendStub.calledOnce)
  //   t.ok(schemaEndpointsTransformerMock.calledOnce)

  //   arrowGetGlobalStub.restore()
  //   arrowAPIExtendStub.restore()

  //   schemaModelsTransformerMock.resetHistory()
  //   schemaEndpointsTransformerMock.resetHistory()

  //   createModelsSpy.resetHistory()

  //   t.end()
  // })
  schemaModelsTransformerMock.resetHistory()
  createModelsSpy.resetHistory()
  t.end()
})

test('### Should create models from schema ###', function (t) {
  // const arrowGetGlobalSpy = sinon.spy()
  // const arrowGetGlobalStub = sinon.stub(Arrow, 'getGlobal', () => {
  //   arrowGetGlobalSpy()

  //   return arrowGlobalMock
  // })
  // const arrowAPIExtendStub = sinon.stub(Arrow.API, 'extend').returns(() => { })

  schemaModelsTransformerMock.returns({})
  // schemaEndpointsTransformerMock.returns(null)

  // Test call
  createModelsFromSchema.call({ schema: null })

  t.ok(createModelsSpy.calledOnce)
  t.ok(schemaModelsTransformerMock.calledOnce)
  // t.ok(arrowGetGlobalSpy.calledOnce)

  // setImmediate(() => {
  //   t.equal(arrowAPIExtendStub.callCount, 0)
  //   t.ok(schemaEndpointsTransformerMock.calledOnce)

  //   arrowGetGlobalStub.restore()
  //   arrowAPIExtendStub.restore()

  //   t.end()
  // })
  t.end()
})

test('### Disable mockery ###', function (t) {
  mockery.deregisterMock('../../utils/schemaModelsTransformer', schemaModelsTransformerMock)
  // mockery.deregisterMock('../../utils/schemaEndpointsTransformer', schemaEndpointsTransformerMock)
  mockery.deregisterMock('appc-connector-utils', utilsMock)
  mockery.disable()

  t.end()
})
