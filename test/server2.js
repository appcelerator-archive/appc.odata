'use strict'

const Arrow = require('arrow')
const utils = require('appc-connector-utils')

module.exports = function (options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    // If options.startServer is set to false arrow won't start
    // real http server and won't load connectors and stuff
    if (options.startServer === false) {
      // Arrow instance
      resolve(utils.arrow.createArrow())
    } else {
      const arrow = utils.arrow.createWithConnectorAndConnect()

      if (options.generateTestModels !== false) {
        var connector = arrow.connector
        // Create test model - Categories
        arrow.server.addModel(Arrow.createModel('Categories', {
          name: 'Categories',
          connector,
          fields: {
            Description: {
              type: 'string',
              required: false
            },
            Name: {
              type: 'string',
              required: false
            },
            Products: {
              type: 'array',
              required: false,
              model: 'Product'
            }
          },
          metadata: {
            primarykey: 'id'
          }
        }))

        // Create test model - Products
        arrow.server.addModel(Arrow.createModel('Products', {
          name: 'Products',
          connector,
          fields: {
            CategoryId: {
              type: 'string',
              required: true
            },
            Discontinued: {
              type: 'boolean',
              required: false
            },
            Name: {
              type: 'string',
              required: false
            },
            QuantityPerUnit: {
              type: 'string',
              required: false
            },
            UnitPrice: {
              type: 'number',
              required: false
            },
            Category: {
              type: 'string',
              required: false,
              model: 'Category'
            }
          },
          metadata: {
            primarykey: 'id'
          }
        }))
      }

      // Return the arrow instance
      resolve(arrow.server)
    }
  })
}
