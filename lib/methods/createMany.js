'use strict'

const modelUtils = require('../../utils/modelUtils')
const async = require('async')

/**
 * Inserts many Model's records into the db
 *
 * @param {Object} Model
 * @param {Object} data
 * @returns {Promise}
 */
exports.createMany = function (Model, data) {
  return new Promise((resolve, reject) => {
    // Create multiple items
    async.map(data, (item, cb) => {
      this.OData(modelUtils.getName(Model))
        .create(item)
        .then((result) => {
          if (result && result.data) {
            cb(null, result.data)
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
