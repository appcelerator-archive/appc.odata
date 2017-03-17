'use strict'

const fetchmetadata = require('../../../../lib/metadata/fetchMetadata').fetchMetadata
const sinon = require('sinon')
const test = require('tap').test

test('### FetchMetadata unit test ### ', function (t) {
  const sandbox = sinon.sandbox.create()
  var next = sinon.spy()
  const data = {
    fields: [{
      'type': 'text',
      'required': true,
      'default': '',
      'validator': null,
      'name': 'url',
      'description': 'connection url'
    }]
  }
  fetchmetadata(next)
  t.ok(next.calledOnce)
  t.equals(next.firstCall.args[0], null)
  t.deepequal(next.firstCall.args[1], data)
  t.end()

  sandbox.restore()
})
