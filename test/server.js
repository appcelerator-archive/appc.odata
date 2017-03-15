'use strict'

const Arrow = require('arrow')
const connector = require('../lib')
const schema = require('../lib/schema/fetchSchema')
const path = require('path')
const mockery = require('mockery')

// Init mockery
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
})

module.exports = function (options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    // Arrow instance
    const server = new Arrow()

    // If options.startServer is set to false arrow won't start
    // real http server and won't load connectors and stuff
    if (options.startServer === false) {
      resolve(server)
    } else {
      var fetchSchema

      // If options.connectService is set to true, the server will
      // try to connect with the odata source
      // If it's set to false the connector will be started
      // with NO ConnectsToADataSource capabilities
      if (options.connectService !== true) {
        // Store connector's original fetchSchema method
        fetchSchema = schema.fetchSchema
        // Mock connector's fetchSchema method with null
        schema.fetchSchema = null

        // Store connector's original create method
        const connectorCreateFn = connector.create
        // Mock connector's create method
        connector.create = () => {
          // Restore connector's original create method
          connector.create = connectorCreateFn

          var Connector = Arrow.Connector
          var Capabilities = Connector.Capabilities

          // Use Connector's capabilities which are suitable
          // for the unit tests and not for the real connector's work
          return Connector.extend({
            filename: path.resolve(__dirname, '../lib/index.js'),
            capabilities: [
              Capabilities.CanCreate,
              Capabilities.CanRetrieve,
              Capabilities.CanUpdate,
              Capabilities.CanDelete
            ]
          })
        }
      }

      const connectPath = path.resolve(__dirname, '..', './lib/lifecycle/connect.js')
      const disconnectPath = path.resolve(__dirname, '..', './lib/lifecycle/disconnect.js')

      // Mock connect lifecycle method
      mockery.registerMock(connectPath, {
        connect: (cb) => { cb() }
      })

      // Mock disconnect lifecycle method
      mockery.registerMock(disconnectPath, {
        disconnect: (cb) => { cb() }
      })

      // Start Arrow Server
      server.start(function (err) {
        if (options.connectService !== true && fetchSchema) {
          // Restore connector's original fetchSchema method
          schema.fetchSchema = fetchSchema
        }

        if (options.generateTestModels !== false) {
          var connector = server.getConnector('appc.odata')
          // Create test model - Categories
          server.addModel(Arrow.createModel('Categories', {
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
          server.addModel(Arrow.createModel('Products', {
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

        mockery.deregisterMock(connectPath)
        mockery.deregisterMock(disconnectPath)
        mockery.disable()

        // Return the arrow instance
        if (err) {
          reject(err)
        } else {
          resolve(server)
        }
      })
    }
  })
}
