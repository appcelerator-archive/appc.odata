'use strict'

const validateQuery = require('../../../utils/validationUtils').validateQuery
const test = require('tap').test
const sinon = require('sinon')
const Joi = require('joi')

test('### ValidationUtils test ###', function (t) {
  const data = ''
  const joiStub = sinon.stub(Joi, 'validate', (data, schema) => {
    var test = {
      error: 'test'
    }
    return test
  })
  validateQuery(data)
  t.ok(joiStub.calledOnce)
  t.equals(joiStub.firstCall.args[0], data)

  joiStub.restore()
  t.end()
})
