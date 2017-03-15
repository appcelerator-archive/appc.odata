'use strinct'

const validationUtils = require('../../utils/validationUtils')
const modelUtils = require('../../utils/modelUtils')
const Arrow = require('arrow')

/**
 * Performs a query and returns a distinct result set based on the field(s).
 * @param {Arrow.Model} Model Model class to check.
 * @param {String} field Comma-separated list of fields.
 * @param {ArrowQueryOptions} [options] Query options.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the distinct values array.
 */
exports.distinct = function distinct (Model, field, options, callback) {
  // Validates the query options
  var error = validationUtils.validateQuery(options)

  if (error) {
    return callback(new Arrow.ORMError(error.message))
  }

  this.OData(modelUtils.getName(Model))
    .distinct(Model, field, options)
    .then((results) => {
      callback(null, results)
    })
    .catch(callback)
}
