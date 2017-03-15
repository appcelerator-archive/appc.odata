'use strict'

const modelUtils = require('../../utils/modelUtils')

/**
 * Deletes the model instance.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Arrow.Instance} instance Model instance.
 * @param {Function} callback Callback passed an Error object (or null if successful), and the deleted model.
 */
exports['delete'] = function (Model, instance, callback) {
  this.OData(modelUtils.getName(Model))
    .deleteOne(instance.id)
    .then((result) => {
      if (result && result.affectedRows === 1) {
        callback(null, instance)
      } else {
        callback()
      }
    })
    .catch((err) => {
      callback(err.message)
    })
}
