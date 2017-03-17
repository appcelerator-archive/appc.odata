'use strict'

const R = require('ramda')
const mixinDeep = require('mixin-deep')

/**
 * Transform Object to array, i.e. if the obj param
 * is array - just returns it, but if the obj is Object
 * it returns array with one item and the obj is the item
 *
 * @param {*} obj
 * @returns {Array}
 */
exports.objectToArray = function (obj) {
  if (!obj) {
    return []
  }
  return R.isArrayLike(obj) ? obj : [obj]
}

/**
 * Creates mixin from inner objects based on prop name, i.e.
 * if the propName equals 'test'
 *
 * {
 *  entitiesX: {
 *    test: {
 *      x: 1
 *    }
 *  },
 *  entitiesY: {
 *    test: {
 *      y: 2
 *    }
 *  }
 * }
 *
 * the result will be:
 * {
 *  x: 1,
 *  y: 2
 * }
 *
 * @param {string} propName
 * @param {Object} src
 * @returns {Object}
 */
module.exports.mixin = function (propName, src) {
  return Object.keys(src).reduce((result, key) => {
    return mixinDeep(result, src[key][propName])
  }, {})
}

/**
 * Because API rest calls for the oData serveces requires
 * the primarykey value to be wrapped in quotes if the value
 * is string, this method checks the type of the PK value
 *
 * @param {*} name
 * @param {*} key
 * @returns {string}
 */
module.exports.resolveValue = function (value) {
  return typeof value === 'string' ? `'${value}'` : `${value}`
}

/**
 * Translates a "where" object in to the relevant portion of a OData Query.
 * @param {Object} where
 * @param {string} str
 * @param {string} key
 * @returns {string}
 */
module.exports.translateWhereToQuery = function (where, str, key) {
  str += str === '' ? '' : ' and '

  if (where[key] && where[key].$like) {
    str += `(substringof(${this.resolveValue(where[key].$like)}, ${key})`
  } else if (where[key] && where[key].$lt) {
    str += `(${key} lt ${this.resolveValue(where[key].$lt)})`
  } else if (where[key] && where[key].$lte) {
    str += `(${key} le ${this.resolveValue(where[key].$lte)})`
  } else if (where[key] && where[key].$gt) {
    str += `(${key} gt ${this.resolveValue(where[key].$gt)})`
  } else if (where[key] && where[key].$gte) {
    str += `(${key} ge ${this.resolveValue(where[key].$gte)})`
  } else if (where[key] && where[key].$ne) {
    str += `(${key} ne ${this.resolveValue(where[key].$ne)})`
  } else if ((where[key] && where[key].$eq)) {
    str += `(${key} eq ${this.resolveValue(where[key].$eq)})`
  } else if (typeof where[key] === 'string') {
    str += `(${key} eq ${this.resolveValue(where[key])})`
  }
  return str
}

