'use strict'

const R = require('ramda')
const utils = require('./utils')
const mixin = utils.mixin

/**
 * Transform array to Object by ns + key
 *
 * @param {string} key
 * @returns {Object}
 */
const arrayToObject = exports.arrayToObject = R.curry(function (options, coll) {
  const ns = options.ns
  const key = options.key

  if (!coll) {
    return {}
  } else if (R.isArrayLike(coll)) {
    return R.indexBy((item) => resolveName(ns, R.prop(key)(item)))(coll)
  } else {
    var result = {}
    result[ns ? `${ns}.${coll[key]}` : coll[key]] = coll
    return result
  }
})

/**
 * Returns the full name(with the namespace if it exists)
 *
 * @param {string} ns
 * @param {string} name
 * @returns {string}
 */
const resolveName = exports.resolveName = function (ns, name) {
  return ns ? `${ns}.${name}` : name
}

/**
 * Check if the filed is an Entity type collection
 *
 * @param {string} type
 * @returns {Boolean}
 */
function isTypeCollection (type) {
  return typeof type === 'string' && type.match(/^Collection\(.+\)$/)
}

/**
 * Transfrom Entity field type to Arrow Model's field type
 *
 * @param {string} ns
 * @param {Object} complexTypes
 * @param {Object} enumTypes
 * @param {string} model
 * @returns {string}
 */
exports.resolveType = function (src, options) {
  const entityTypes = mixin('entityTypes', src)
  const complexTypes = mixin('complexTypes', src)
  const enumTypes = mixin('enumTypes', src)
  const model = options.model
  const isForeign = options.isForeign

  if (isTypeCollection(model)) {
    return 'array'
  } else if (isForeign || (entityTypes && entityTypes[model])) {
    // Get the foreign key field type by looking in the navigated model's schema
    const fkType = R.path(['Key', 'PropertyRef', 'Name'], entityTypes[model])
    const relatedModelPkField = arrayToObject({ key: 'Name' }, R.prop(['Property'], entityTypes[model]))[fkType]
    const pkFieldType = R.path(['Type'], relatedModelPkField)

    return convertDataTypeToJSType(pkFieldType)
  } else if (enumTypes && enumTypes[model]) {
    return 'string'
  } else if (complexTypes && complexTypes[model]) {
    return 'object'
  } else {
    return convertDataTypeToJSType(model)
  }
}

function convertDataTypeToJSType (dataType) {
  switch (dataType) {
    case 'Edm.Boolean':
      return 'boolean'
    case 'Edm.Single':
    case 'Edm.SByte':
    case 'Edm.Int64':
    case 'Edm.Int32':
    case 'Edm.Int16':
    case 'Edm.Guid':
    case 'Edm.Double':
    case 'Edm.Decimal':
    case 'Edm.Byte':
    case 'Edm.Binary':
      return 'number'
    case 'Edm.DateTime':
    case 'Edm.Time':
    case 'Edm.DateTimeOffset':
      return 'date'
    default:
      return 'string'
  }
}

module.exports.getResource = function (path, src) {
  var value
  Object.keys(src).some((key) => {
    value = R.path([key].concat(path), src)

    return !!value
  })

  return value
}

module.exports.hasResource = function (path, src) {
  return Object.keys(src).some((key) => {
    return !!R.path([key].concat(path), src)
  })
}
