'use strict'

const o = require('odata')
const sinon = require('sinon')

module.exports = (spies, options) => {
  spies = spies || {}
  options = options || {}
  return (modelName) => {
    var instance = o(modelName)

    instance.oConfig = {
      headers: {}
    }

    sinon
      .stub(instance, 'skip').callsFake((skipAmount) => {
        spies.skipSpy && spies.skipSpy(skipAmount)
        return instance
      })

    sinon
      .stub(instance, 'take').callsFake((takeAmount) => {
        spies.takeSpy && spies.takeSpy(takeAmount)
        return instance
      })

    sinon
      .stub(instance, 'expand').callsFake((expandStr) => {
        spies.expandSpy && spies.expandSpy(expandStr)
        return instance
      })

    sinon
      .stub(instance, 'select').callsFake((selectStr) => {
        spies.selectSpy && spies.selectSpy(selectStr)
        return instance
      })

    sinon
      .stub(instance, 'filter').callsFake((filterStr) => {
        spies.filterSpy && spies.filterSpy(filterStr)
        return instance
      })

    sinon
      .stub(instance, 'orderBy').callsFake((orderStr, direction) => {
        spies.orderBySpy && spies.orderBySpy(orderStr, direction)
        return instance
      })

    sinon
      .stub(instance, 'remove').callsFake((res) => {
        spies.removeSpy && spies.removeSpy(res)
        return instance
      })

    sinon
      .stub(instance, 'find').callsFake((getId) => {
        spies.findSpy && spies.findSpy(getId)
        return instance
      })

    sinon
      .stub(instance, 'post').callsFake((data, res) => {
        spies.postSpy && spies.postSpy(data, res)
        return instance
      })

    sinon
      .stub(instance, 'put').callsFake((data, res) => {
        spies.putSpy && spies.putSpy(data, res)
        return instance
      })

    sinon
      .stub(instance, 'get').callsFake((callback, errorCallback) => {
        spies.getSpy && spies.getSpy(callback, errorCallback)

        // Handle response
        return {
          then: (cb) => {
            if (typeof options.fail === 'undefined') {
              setImmediate(() => {
                cb(options.getResult)
              })
            }
            return {
              fail: (cb) => {
                if (options.fail) {
                  setImmediate(() => {
                    cb(
                      new Error('Fail')
                    )
                  })
                }
              }
            }
          }
        }
      })

    sinon
      .stub(instance, 'save').callsFake((callback, errorCallback) => {
        spies.saveSpy && spies.saveSpy(callback, errorCallback)

        // Handle response
        if (typeof options.fail === 'undefined') {
          setImmediate(() => {
            callback(options.saveResult)
          })
        } else {
          setImmediate(() => {
            errorCallback(500,
              new Error('Fail')
            )
          })
        }
      })

    return instance
  }
}
