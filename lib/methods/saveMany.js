'use strict'

const async = require('async')
const modelUtils = require('../../utils/modelUtils')

/**
 * Updates many Model's records from the db
 *
 * @param {Object} Model
 * @param {Object} doc
 * @param {Object} data
 * @returns {Promise}
 */
exports.saveMany = function (Model, doc, data) {
  return new Promise((resolve, reject) => {
    const modelName = modelUtils.getName(Model)
    // Save multiple items
    async.map(data, (item, cb) => {
      // Primary key value
      const key = modelUtils.getPK(modelName, item)

      item = Object.assign({}, item, doc)

      this.OData(modelName)
        .update(key, doc, item)
        .then((result) => {
          if (result && result.affectedRows) {
            cb(null, item)
          } else {
            cb()
          }
        })
        .catch(cb)
    }, (err, results) => {
      if (err) {
        return reject(err)
      }

      resolve(modelUtils.createCollectionFromPayload(Model, results))
    })
  })
}
