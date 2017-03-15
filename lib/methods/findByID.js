'use strict'

const modelUtils = require('../../utils/modelUtils')

/**
 * Finds a model instance using the primary key.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {String} id ID of the model to find.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the found model.
 */
exports.findByID = function (Model, id, callback) {
  this.OData(modelUtils.getName(Model))
    .findByID(id)
    .then((result) => {
      if (result && result.data) {
        // Turn the instance into a model, and return it.
        callback(null, modelUtils.createModelFromPayload(Model, result.data))
      } else {
        callback()
      }
    })
    .catch((err) => {
      callback(err.message)
    })
}
