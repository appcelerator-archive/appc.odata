'use strict'

const Arrow = require('arrow')

module.exports = function (options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    const arrow = new Arrow({}, true)
    const connector = arrow.getConnector('appc.odata')

    if (options.generateTestModels !== false) {
      // Create test model - Categories
      arrow.addModel(Arrow.createModel('Categories', {
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
      arrow.addModel(Arrow.createModel('Products', {
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
    resolve(arrow)
  })
}
