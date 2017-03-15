'use strict'

const modelUtils = require('../../utils/modelUtils')

/**
 * Makes oData function calls.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Object} params Function params.
 * @param {Object} options Function options.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the found model.
 */
exports.executeFn = function (Model, params, options, callback) {
  this.OData(options.fn)
    .execute(params)
    .then((result) => {
      if (Model) {
        // TODO: remove returnCollection, check return type for coll
        if (options.returnCollection) {
          // Turn the array of instances in to a collection, and return it.
          return callback(null, modelUtils.createCollectionFromPayload(Model, result.data))
        } else {
          return callback(null, modelUtils.createModelFromPayload(Model, result.data))
        }
      }

      callback(null, result.data)
    })
    .catch(callback)
}
