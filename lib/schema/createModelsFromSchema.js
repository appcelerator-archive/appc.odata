'use strict'

const Arrow = require('arrow')

const utils = require('appc-connector-utils')
const schemaModelsTransformer = require('../../utils/schemaModelsTransformer')
const schemaEndpointsTransformer = require('../../utils/schemaEndpointsTransformer')

/**
 * Creates models from your schema.
 */
exports.createModelsFromSchema = function () {
  const api = utils(this)
  const global = Arrow.getGlobal()

  // Generate Arrow Models
  api.createModels(schemaModelsTransformer(this, this.schema))

  // Generate Arrow Endpoints
  // It's delayed in the time because the arrow model's are
  // still not registered in arrow during this function call
  setImmediate(() => {
    // OData $metadata functions/actions schema to arrow endpoints's schema
    var apis = schemaEndpointsTransformer(this, this.schema) || []

    apis.forEach(function (apiDef) {
      // Functions/actions definition to arrow api endpoints
      const fn = Arrow.API.extend(apiDef)
      // Register the api function in arrow
      global.apis.push(fn.call(global.app, {}, global))
    })
  })
}
