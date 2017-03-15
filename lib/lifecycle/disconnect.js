'use strict'

/**
 * Remove SDK instance builder from the connector
 * @param next
 */
exports.disconnect = function (next) {
  this.OData = null

  next()
}
