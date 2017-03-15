'use strict'

const modelUtils = require('../../utils/modelUtils')

/**
 * Finds all model instances.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the models.
 */
exports.findAll = function findAll (Model, callback) {
  const limit = 1000

  this.OData(modelUtils.getName(Model))
    .findAll(limit)
    .then((result) => {
      // Turn the array of instances into a collection, and return it.
      callback(null, modelUtils.createCollectionFromPayload(Model, result.data))
    })
    .catch(callback)
}
