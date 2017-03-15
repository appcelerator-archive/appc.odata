'use strict'

const utils = require('./utils')

module.exports.translateWhereToQuery = function (where, str, key) {
  str += str === '' ? '' : ' and '

  if (where[key] && where[key].$like) {
    str += `(substringof(${utils.resolveValue(where[key].$like)}, ${key})`
  } else if (where[key] && where[key].$lt) {
    str += `(${key} lt ${utils.resolveValue(where[key].$lt)})`
  } else if (where[key] && where[key].$lte) {
    str += `(${key} le ${utils.resolveValue(where[key].$lte)})`
  } else if (where[key] && where[key].$gt) {
    str += `(${key} gt ${utils.resolveValue(where[key].$gt)})`
  } else if (where[key] && where[key].$gte) {
    str += `(${key} ge ${utils.resolveValue(where[key].$gte)})`
  } else if (where[key] && where[key].$ne) {
    str += `(${key} ne ${utils.resolveValue(where[key].$ne)})`
  } else if ((where[key] && where[key].$eq)) {
    str += `(${key} eq ${utils.resolveValue(where[key].$eq)})`
  } else if (typeof where[key] === 'string') {
    str += `(${key} eq ${utils.resolveValue(where[key])})`
  }
  return str
}
