'use strict'

const modelUtils = require('../../utils/modelUtils')
const validationUtils = require('../../utils/validationUtils')
const Arrow = require('arrow')

/**
 * Queries for particular model records.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {ArrowQueryOptions} options Query options.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the model records.
 * @throws {Error} Failed to parse query options.
 */
exports.query = function (Model, options, callback) {
  // Validates the query options
  var error = validationUtils.validateQuery(options)

  if (error) {
    return callback(new Arrow.ORMError(error.message))
  }

  this.OData(modelUtils.getName(Model))
    .query(Model, options)
    .then((result) => {
      if (result && result.data) {
        // Turn the array of instances into a collection, and return it.
        callback(null, modelUtils.createCollectionFromPayload(Model, result.data))
      } else {
        callback()
      }
    })
    .catch(callback)
}
