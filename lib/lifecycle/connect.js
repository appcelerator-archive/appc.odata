'use strict'

const o = require('odata')
const OData = require('../../utils/OData')

/**
 * Add SDK instance builder to the connector
 * @param next
 */
exports.connect = function (next) {
  // Initialize OData Lib to use odata
  // npm sdk for internal api calls
  this.OData = OData(o, this.config)

  next()
}
