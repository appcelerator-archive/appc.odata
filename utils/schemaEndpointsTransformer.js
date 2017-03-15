'use strict'

const R = require('ramda')
const schemaUtils = require('./schemaUtils')
const utils = require('./utils')

const arrayToObject = schemaUtils.arrayToObject
const objectToArray = utils.objectToArray
const resolveType = schemaUtils.resolveType
const resolveName = schemaUtils.resolveName
const mixin = utils.mixin

const executeFn = require('../lib/methods/executeFn').executeFn

/**
 * Default export
 * Transform odata $metadata to arrow function's schema
 *
 * @param {Object} connector
 * @param {Object} src
 * @returns {Object}
 */
module.exports = function (connector, src) {
  return R.compose(
    generateFunctionsSchema(connector),
    R.path(['edmx:Edmx', 'edmx:DataServices', 'Schema'])
  )(src)
}

/**
 * Trasform json entity functions/actions schema to Arrow APIs schema
 *
 * @param {Object} connector
 * @returns {Object}
 */
function generateFunctionsSchema (connector) {
  return (src) => {
    // Transform source collection
    var transformed = sourceSchemaTransform(src)

    // Generate endpoints from entity containers $metadata
    const schema = entityContainersToEndpoints(connector, transformed)

    // Returns the transformed schema
    return schema
  }
}

/**
 * Returns the schema data required for endpoints generation
 *
 * @param {Object} src
 * @returns {Object}
 */
function sourceSchemaTransform (src) {
  return R.mapObjIndexed((currSrc, ns) => {
    return {
      entityContainers: objectToArray(src.EntityContainer),
      functions: arrayToObject({ ns: src.Namespace, key: 'Name' }, src.Function),
      actions: arrayToObject({ ns: src.Namespace, key: 'Name' }, src.Action),
      ns: src.Namespace
    }
  }, arrayToObject({ key: 'Namespace' }, src))
}

/**
 * Generate endpoints from entity containers $metadata
 *
 * @param {Object} connector
 * @param {Array} transformed
 * @returns {Array}
 */
function entityContainersToEndpoints (connector, transformed) {
  var schema = []
  R.mapObjIndexed((currSrc, ns, src) => {
    if (!R.isNil(R.prop(['entityContainers'], currSrc))) {
      // Public models and functions/actions
      const entityContainers = objectToArray(currSrc.entityContainers)

      if (entityContainers && entityContainers.length) {
        R.forEach((entityContainer) => {
          schema = schema.concat(endpointsTransform(connector, src, {}, entityContainer))
        }, entityContainers)
      }
    }
  }, transformed)
  return schema
}

/**
 * Transform json entity functions schema to Arrow functions schema
 *
 * @param {Object} connector
 * @param {Object} src
 * @param {Object} options
 * @param {Object} entityContainer
 * @returns {Array}
 */
function endpointsTransform (connector, src, options, entityContainer) {
  const functions = objectToArray(R.prop('FunctionImport', entityContainer))
  const functionsSchema = functions.map(
    endpointTransform(connector, src, options, 'function')
  ) || []

  const actions = objectToArray(R.prop('ActionImport', entityContainer))
  const actionsSchema = actions.map(
    endpointTransform(connector, src, options, 'action')
  ) || []

  return functionsSchema.concat(actionsSchema)
}

/**
 * Transform json entity function/action schema to Arrow function schema
 *
 * @param {Object} connector
 * @param {Object} src
 * @param {Object} options
 * @param {Object} obj
 * @returns {Object}
 */
const endpointTransform = R.curry(function (connector, src, options, type, obj) {
  options = options || {}

  const functions = mixin('functions', src)
  const actions = mixin('actions', src)
  const ns = src.ns

  var group
  var def

  switch (type) {
    case 'function':
      group = 'Functions'
      def = functions[obj.Function || resolveName(ns, obj.Name)] || obj
      break
    case 'action':
      group = 'Actions'
      def = actions[obj.Action || resolveName(ns, obj.Name)] || obj
      break
  }

  // Basic immutable function's schema
  var endpointSchema = {
    name: obj.Name,
    group,
    path: `/api/${R.toLower(obj.Name)}`,
    method: 'GET',
    description: 'oData auto-generated API',
    action: function (req, resp, next) {
      executeFn.call(connector, req.model || null, req.params, { fn: def.Name, returnCollection: /Collection\(.+\)/.test(def.ReturnType) }, next)
    }
  }

  // Add response model
  if (obj.EntitySet) {
    endpointSchema.model = obj.EntitySet
  }

  // Add request params
  if (def.Parameter) {
    endpointSchema.path += generateApiParamsPathSubPath(def.Parameter)
    endpointSchema.parameters = {}

    objectToArray(def.Parameter).forEach((paramDef) => {
      // Api call params
      endpointSchema.parameters[paramDef.Name] = {
        description: paramDef.Name,
        type: resolveType(src, { model: paramDef.Type })
      }
    })
  }

  // Generate Arrow APIs endpoint based on function/action schema definitions
  return endpointSchema
})

/**
 * Generate path substring with API params expected for the oData function call
 * Example: '/:lat/:lon'
 *
 * @param {Object} paramsDef
 * @returns {string}
 */
function generateApiParamsPathSubPath (paramsDef) {
  return objectToArray(paramsDef).reduce((result, currParam) => {
    return `${result}/:${currParam.Name}`
  }, '')
}
