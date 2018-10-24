'use strict'

const test = require('tap').test
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const schemaModelsTransformer = require('../../../utils/schemaModelsTransformer')
const txtSchemaJSON = require('../../txtSchemaJSON')

test('### Should transforms shema to models ###', testWrap(function (t) {
  const schema = schemaModelsTransformer({}, txtSchemaJSON)

  t.ok(schema)

  t.ok(schema.Airlines)
  t.ok(schema.Airlines.connector)
  t.ok(schema.Airlines.fields)
  t.ok(schema.Airlines.metadata)
  t.ok(schema.Airlines.metadata['appc.odata'].primarykey)
  t.ok(schema.Airlines.name)

  t.ok(schema.Airports)
  t.ok(schema.Airports.connector)
  t.ok(schema.Airports.fields)
  t.ok(schema.Airports.metadata)
  t.ok(schema.Airports.metadata['appc.odata'].primarykey)
  t.ok(schema.Airports.name)

  t.ok(schema.Me)
  t.ok(schema.Me.connector)
  t.ok(schema.Me.fields)
  t.ok(schema.Me.metadata)
  t.ok(schema.Me.name)

  t.ok(schema.NewComePeople)
  t.ok(schema.NewComePeople.connector)
  t.ok(schema.NewComePeople.fields)
  t.ok(schema.NewComePeople.metadata)
  t.ok(schema.NewComePeople.name)

  t.ok(schema.People)
  t.ok(schema.People.connector)
  t.ok(schema.People.fields)
  t.ok(schema.People.metadata)
  t.ok(schema.People.metadata['appc.odata'].primarykey)
  t.ok(schema.People.name)

  t.end()
}))
