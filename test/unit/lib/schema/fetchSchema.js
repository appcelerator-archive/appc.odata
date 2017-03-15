'use strict'

const test = require('tap').test
const sinon = require('sinon')
const request = require('request')
const fastXmlParser = require('fast-xml-parser')

const txtSchemaXML = require('../../../txtSchemaXML')
const fetchSchema = require('../../../../lib/schema/fetchSchema').fetchSchema

test('### Should returns no schema ###', sinon.test(function (t) {
  const cbSpy = this.spy()

  this.stub(request, 'get', (url, cb) => {
    cb()
  })

  const schema = fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.notOk(schema)
  t.end()
}))

test('### Should returns schema ###', sinon.test(function (t) {
  const cbSpy = this.spy()

  this.stub(fastXmlParser, 'parse', (data, options) => {
    return {}
  })

  this.stub(request, 'get', (url, cb) => {
    cb(null, { body: txtSchemaXML })
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.ok(cbSpy.calledOnce)
  t.end()
}))

test('### Should returns schema ###', sinon.test(function (t) {
  const cbErrorSpy = this.spy()

  this.stub(request, 'get', (url, cb) => {
    cb(null, { error: 'Error' })
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbErrorSpy)

  t.ok(cbErrorSpy.calledOnce)
  t.ok(cbErrorSpy.calledWith('Error'))
  t.end()
}))

test('### Should returns error ###', sinon.test(function (t) {
  const cbSpy = this.spy()
  const errMsg = { message: 'Fail' }

  this.stub(request, 'get', (url, cb) => {
    cb(errMsg)
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith({ message: 'Fail' }))
  t.end()
}))

test('### Should returns error ###', sinon.test(function (t) {
  const cbSpy = this.spy()
  const errObj = new Error('Fail')

  this.stub(fastXmlParser, 'parse', (data, options) => {
    throw errObj
  })

  this.stub(request, 'get', (url, cb) => {
    cb(null, { body: txtSchemaXML })
  })

  fetchSchema.call({
    config: {
      url: 'localhost'
    }
  }, cbSpy)

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errObj))
  t.end()
}))
