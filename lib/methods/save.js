'use strict'

const Arrow = require('arrow')
const modelUtils = require('../../utils/modelUtils')

/**
 * Updates a Model instance.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Arrow.Instance} instance Model instance to update.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the updated model.
 */
exports.save = function (Model, instance, callback) {
  const modelName = modelUtils.getName(Model)

  // Must have primary key column
  if (!modelUtils.hasPKColumn(modelName)) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + modelName))
  }

  // Must not update the primary key
  if (modelUtils.isPKUpdated(modelName, instance)) {
    return callback(new Arrow.ORMError('primary key column can\'t be updated'))
  }

  // Primary key value
  const key = modelUtils.getPK(modelName, instance)

  this.OData(modelName)
    .update(key, instance.getChangedFields(), instance.toJSON())
    .then((result) => {
      if (result && result.affectedRows) {
        callback(null, instance)
      } else {
        callback()
      }
    })
    .catch(callback)
}
