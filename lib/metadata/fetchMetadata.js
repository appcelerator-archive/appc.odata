'use strict'

var Arrow = require('arrow')

/**
 * Fetches metadata describing your connector's proper configuration.
 * @param next
 */
exports.fetchMetadata = function fetchMetadata (next) {
  next(null, {
    fields: [
      Arrow.Metadata.Text({
        name: 'url',
        description: 'connection url',
        required: true
      })
    ]
  })
}
