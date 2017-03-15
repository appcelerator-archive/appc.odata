'use strict'

'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const server = require('../server')
var arrow

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst

      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('Model Categories should be created correctly', t => {
  const model = arrow.getModel('Categories')

  t.equals(model.fields.Description.type, 'string')
  t.equals(model.fields.Description.required, false)
  t.equals(model.fields.Name.type, 'string')
  t.equals(model.fields.Name.required, false)
  t.equals(model.fields.Products.type, 'array')
  t.equals(model.fields.Name.required, false)
  t.equals(model.metadata.primarykey, 'id')
  t.end()
})

test('Model Products should be created correctly', t => {
  const model = arrow.getModel('Products')

  t.equals(model.fields.Category.type, 'string')
  t.equals(model.fields.Category.required, false)
  t.equals(model.fields.CategoryId.type, 'string')
  t.equals(model.fields.Discontinued.required, false)
  t.equals(model.fields.Discontinued.type, 'boolean')
  t.equals(model.fields.Name.type, 'string')
  t.equals(model.fields.Name.required, false)
  t.equals(model.fields.QuantityPerUnit.type, 'string')
  t.equals(model.fields.Name.required, false)
  t.equals(model.fields.UnitPrice.type, 'number')
  t.equals(model.fields.UnitPrice.required, false)
  t.equals(model.metadata.primarykey, 'id')
  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
