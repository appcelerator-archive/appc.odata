'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)

const executeFn = require('../../../lib/methods/executeFn')
const txtSchemaJSON = require('../../txtSchemaJSON')

test('### Should transforms shema to endpoints ###', testWrap(function (t) {
  const executeFnStub = this.stub(executeFn, 'executeFn').callsFake(function (Model, params, options, callback) {
    callback()
  })

  const schemaEndpointsTransformer = require('../../../utils/schemaEndpointsTransformer')
  const schema = schemaEndpointsTransformer({}, txtSchemaJSON)

  schema[0].action({}, {}, () => { })

  t.ok(schema)
  t.equal(schema.length, 3)

  t.ok(schema[0].action)
  t.ok(schema[0].description)
  t.ok(schema[0].group)
  t.ok(schema[0].method)
  t.ok(schema[0].model)
  t.ok(schema[0].name)
  t.ok(schema[0].path)
  t.ok(executeFnStub.calledOnce)
  t.type(schema[0].action, 'function')

  t.ok(schema[1].action)
  t.ok(schema[1].description)
  t.ok(schema[1].group)
  t.ok(schema[1].method)
  t.ok(schema[1].model)
  t.ok(schema[1].name)
  t.ok(schema[1].path)
  t.type(schema[1].action, 'function')

  t.ok(schema[2].action)
  t.ok(schema[2].description)
  t.ok(schema[2].group)
  t.ok(schema[2].method)
  t.notOk(schema[2].model)
  t.ok(schema[2].name)
  t.ok(schema[2].path)
  t.type(schema[2].action, 'function')

  t.end()
}))
