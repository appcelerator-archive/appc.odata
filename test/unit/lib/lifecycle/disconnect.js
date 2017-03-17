'use strict'

const sinon = require('sinon')
const test = require('tap').test

const disconnect = require('../../../../lib/lifecycle/disconnect').disconnect
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
  disconnect.call(connector, next)
  t.ok(next.calledOnce)
  t.equals(next.firstCall.args[0], undefined)
  t.equals(connector.OData, null)
  t.end()

  sandbox.restore()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
