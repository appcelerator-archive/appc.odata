'use strict'

const sinon = require('sinon')
const mockery = require('mockery')
const test = require('tap').test
// const OData = require('../../../../utils/OData')

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
})

const odata = (o) => { }
const OData = sinon.spy()

mockery.registerMock('odata', odata)
mockery.registerMock('../../utils/OData', OData)

const connect = require('../../../../lib/lifecycle/connect').connect
const server = require('../../../server')

var arrow
var connector

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst
      connector = arrow.getConnector('appc.odata')

      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### Check if Odata is correctly attached to the connector ###', function (t) {
  const sandbox = sinon.sandbox.create()
  var next = sinon.spy()
  connect.call(connector, next)
  t.ok(next.calledOnce)
  t.equals(next.firstCall.args[0], undefined)
  t.ok(OData.calledOnce)
  t.equals(OData.firstCall.args[0], odata)
  t.equals(OData.firstCall.args[1], connector.config)
  t.end()

  sandbox.restore()
})

test('### Stop Arrow ###', function (t) {
  mockery.disable()

  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
