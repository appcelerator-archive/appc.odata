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
