'use strict'

const validationUtils = require('../../utils/validationUtils')
const modelUtils = require('../../utils/modelUtils')
const Arrow = require('arrow')
const R = require('ramda')

/**
 * Returns a Model items count.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {ArrowQueryOptions} options Query options.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the model records.
 */
exports.count = function (Model, options, callback) {
  const modelName = modelUtils.getName(Model)
  // Use query method to get all the results
  // and returns the count of the items
  if (Object.keys(options).length) {
    // Validates the query options
    var error = validationUtils.validateQuery(options)

    if (error) {
      return callback(new Arrow.ORMError(error.message))
    }

    if (options.where && typeof options.where === 'string') {
      try {
        options.where = JSON.parse(options.where)
      } catch (error) {
        return callback(new Arrow.ORMError(error.message))
      }
    }

    this.OData(modelName)
      .query(Model, options)
      .then((result) => {
        if (R.has('data', result) && R.isArrayLike(result.data)) {
          // Turn the array of instances into a collection, and return it.
          callback(null, result.data.length)
        } else {
          callback(null, 0)
        }
      })
      .catch(callback)
  } else {
    // Use native sdk count method
    this.OData(modelName)
      .count()
      .then((count) => {
        callback(null, count)
      })
      .catch(callback)
  }
}
