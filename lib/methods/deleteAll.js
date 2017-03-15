'use strict'

const modelUtils = require('../../utils/modelUtils')

/**
 * Deletes all the data records.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful), and the deleted models.
 */
exports.deleteAll = function (Model, callback) {
  this.OData(modelUtils.getName(Model))
    .deleteAll()
    .then((result) => {
      if (result && typeof result.affectedRows !== 'undefined') {
        callback(null, result.affectedRows)
      } else {
        callback(null, 0)
      }
    })
    .catch(callback)
}
