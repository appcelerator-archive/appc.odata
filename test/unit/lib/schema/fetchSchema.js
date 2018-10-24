'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const request = require('request')
const fastXmlParser = require('fast-xml-parser')

const txtSchemaXML = require('../../../txtSchemaXML')
const fetchSchema = require('../../../../lib/schema/fetchSchema').fetchSchema
const utils = require('../../../../utils/utils')

const getMainUrlStub = sinon.stub(utils, 'getMainUrl').callsFake((url) => {
  return 'localhost'
})

test('### Should returns no schema ###', testWrap(function (t) {
  const cbSpy = this.spy()

  this.stub(request, 'get').callsFake((url, cb) => {
    cb()
  })

  const schema = fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.notOk(schema)
  t.ok(getMainUrlStub.calledOnce)

  getMainUrlStub.reset()
  t.end()
}))

test('### Should returns schema ###', testWrap(function (t) {
  const cbSpy = this.spy()

  this.stub(fastXmlParser, 'parse').callsFake((data, options) => {
    return {}
  })

  this.stub(request, 'get').callsFake((url, cb) => {
    cb(null, { body: txtSchemaXML })
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.ok(cbSpy.calledOnce)
  t.ok(getMainUrlStub.calledOnce)

  getMainUrlStub.reset()
  t.end()
}))

test('### Should returns schema ###', testWrap(function (t) {
  const cbErrorSpy = this.spy()

  this.stub(request, 'get').callsFake((url, cb) => {
    cb(null, { error: 'Error' })
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbErrorSpy)

  t.ok(cbErrorSpy.calledOnce)
  t.ok(cbErrorSpy.calledWith('Error'))
  t.ok(getMainUrlStub.calledOnce)

  getMainUrlStub.reset()
  t.end()
}))

test('### Should returns error ###', testWrap(function (t) {
  const cbSpy = this.spy()
  const errMsg = { message: 'Fail' }

  this.stub(request, 'get').callsFake((url, cb) => {
    cb(errMsg)
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith({ message: 'Fail' }))
  t.ok(getMainUrlStub.calledOnce)

  getMainUrlStub.reset()
  t.end()
}))

test('### Should returns error ###', testWrap(function (t) {
  const cbSpy = this.spy()
  const errObj = new Error('Fail')

  this.stub(fastXmlParser, 'parse').callsFake((data, options) => {
    throw errObj
  })

  this.stub(request, 'get').callsFake((url, cb) => {
    cb(null, { body: txtSchemaXML })
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errObj))
  t.ok(getMainUrlStub.calledOnce)

  getMainUrlStub.reset()
  t.end()
}))
