'use strict'

const Arrow = require('arrow')
const modelUtils = require('../../utils/modelUtils')
const createMany = require('./createMany').createMany
const saveMany = require('./saveMany').saveMany

/**
 * Updates a model or creates the model if it cannot be found.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {String} id ID of the model to update.
 * @param {Object} doc Model attributes to set.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the updated or new model.
 */
exports.upsert = function upsert (Model, id, doc, callback) {
  const modelName = modelUtils.getName(Model)

  // Must have primary key column
  if (!modelUtils.hasPKColumn(modelName)) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + modelName))
  }

  // Must not update the primary key
  if (modelUtils.isPKUpdated(modelName, doc)) {
    return callback(new Arrow.ORMError('primary key column can\'t be updated'))
  }

  // Delete primary key value
  delete doc[modelUtils.getPKName(modelName)]

  if (typeof id === 'undefined') {
    // Create
    createMany.call(this, Model, [doc])
      .then((results) => {
        callback(null, results[0])
      })
      .catch(callback)
  } else {
    this.OData(modelName)
      .findByID(id)
      .then((result) => {
        if (result && result.data) {
          // Update
          return saveMany.call(this, Model, doc, [result.data])
            .then((results) => {
              callback(null, results[0])
            })
        } else {
          // Create
          return createMany.call(this, Model, [doc])
            .then((results) => {
              callback(null, results[0])
            })
        }
      })
      .catch(callback)
  }
}
