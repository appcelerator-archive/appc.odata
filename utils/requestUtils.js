'use strict'

const R = require('ramda')
const request = require('request')
const Arrow = require('arrow')
const modelUtils = require('./modelUtils')

/**
 * Make api call in order to remove odata item's navigation property
 *
 * @param {string} url
 * @param {string} modelName
 * @param {*} key
 * @param {string} refModel
 * @param {string} refField
 * @param {string} refKey
 * @returns {Promise}
 */
module.exports.generateRemoveRefRequest = R.curry(function (url, modelName, key, refModel, refField, refKey) {
  var options = {
    method: 'DELETE',
    url: `${url}${modelName}(${modelUtils.resolveKey(modelName, key)})/${refField}(${modelUtils.resolveKey(refModel, refKey)})`,
    headers: {
      'If-Match': '*'
    }
  }

  return generateRequest(options)
})

/**
 * Make api call in order to add odata item's navigation property
 *
 * @param {string} url
 * @param {string} modelName
 * @param {*} key
 * @param {string} refModel
 * @param {string} refField
 * @param {string} refKey
 * @returns {Promise}
 */
module.exports.generateAddRefRequest = R.curry(function (url, modelName, key, refModel, refField, refKey) {
  var options = {
    method: 'POST',
    url: `${url}${modelName}(${modelUtils.resolveKey(modelName, key)})/${refField}/$ref`,
    headers: {
      'cache-control': 'no-cache',
      authorization: 'Basic Og==',
      accept: 'application/json',
      'content-type': 'application/json;odata.metadata=minimal',
      'odata-version': '4.0'
    },
    json: { '@odata.id': `${url}${refModel}(${modelUtils.resolveKey(refModel, refKey)})` }
  }

  return generateRequest(options)
})

/**
 * Generates comma separated string of the props should be expanded
 *
 * @param {string} modelName
 * @param {Array} select
 * @returns {Promise}
 */
module.exports.generateExpandFieldsString = function (modelName, select) {
  const fields = Arrow.getModel(modelName).fields
  const fieldsNames = select && R.isArrayLike(select) ? select : Object.keys(fields)

  return fieldsNames
    .filter((prop) => {
      return !!modelUtils.getFieldModelName(modelName, prop)
    })
    .join()
}

/**
 * Make api call in order to get items count
 *
 * @param {string} url
 * @param {string} modelName
 * @returns {Promise}
 */
module.exports.generateCountRequest = function (url, modelName) {
  var options = {
    method: 'GET',
    url: `${url}${modelName}/$count`
  }

  return generateRequest(options)
}

/**
 * Makes api call
 *
 * @param {Object} options
 * @returns {Promise}
 */
function generateRequest (options) {
  return new Promise((resolve, reject) => {
    request(options, function (err, response, body) {
      if (err || (body && body.error)) {
        return reject(err ? err.message : R.path(['error', 'message'], body))
      }

      resolve(body)
    })
  })
}
