'use strict'

const validationUtils = require('../../utils/validationUtils')
const Arrow = require('arrow')
const modelUtils = require('../../utils/modelUtils')
const saveMany = require('./saveMany').saveMany

/**
 * Finds one model instance and modifies it.
 * @param {Arrow.Model} Model
 * @param {ArrowQueryOptions} options Query options.
 * @param {Object} doc Attributes to modify.
 * @param {Object} [args] Optional parameters.
 * @param {Boolean} [args.new=false] Set to `true` to return the new model instead of the original model.
 * @param {Boolean} [args.upsert=false] Set to `true` to allow the method to create a new model.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the modified model.
 * @throws {Error} Failed to parse query options.
 */
exports.findAndModify = function findAndModify (Model, options, doc, callback) {
  const error = validationUtils.validateQuery(options)
  const modelName = modelUtils.getName(Model)

  if (error) {
    return callback(new Arrow.ORMError(error.message))
  }

  // Must have primary key column
  if (!modelUtils.hasPKColumn(modelName)) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + modelName))
  }

  // Must not set the primary key
  if (modelUtils.isPKUpdated(modelName, doc)) {
    return callback(new Arrow.ORMError('primary key column can\'t be specified'))
  }

  this.OData(modelName)
    .query(Model, options)
    .then((result) => {
      if (result && result.data) {
        // Update the records being found
        return saveMany.call(this, Model, doc, result.data)
          .then((results) => {
            callback(null, results)
          })
      } else {
        callback()
      }
    })
    .catch(callback)
}
