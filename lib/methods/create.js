'use strict'

const modelUtils = require('../../utils/modelUtils')
const Arrow = require('arrow')

/**
 * Creates a new Model or Collection object.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Array<Object>/Object} [values] Attributes to set on the new model(s).
 * @param {Function} callback Callback passed an Error object (or null if successful), and the new model or collection.
 * @throws {Error}
 */
exports.create = function (Model, values, callback) {
  const modelName = modelUtils.getName(Model)

  // Must have primary key column
  if (!modelUtils.hasPKColumn(modelName)) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + modelName))
  }

  // Must not set the primary key
  if (modelUtils.isPKUpdated(modelName, values)) {
    return callback(new Arrow.ORMError('primary key column can\'t be specified'))
  }

  // Create item
  this.OData(modelName)
    .create(values)
    .then((result) => {
      callback(null, modelUtils.createModelFromPayload(Model, result.data))
    })
    .catch(callback)
}
