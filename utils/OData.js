'use strict'

const R = require('ramda')
const async = require('async')
const utils = require('./utils')
const modelUtils = require('./modelUtils')
const requestUtils = require('./requestUtils')

var o
var config
module.exports = (sdk, connConfig) => {
  o = sdk
  config = connConfig
  return (name) => new OData(name)
}

/**
 * OData Constructor
 *
 * @param {*} name
 * @returns
 */
function OData (name) {
  const url = config.url
  this.url = url[url.length - 1] === '/' ? url : `${url}/`
  this.name = name

  return this
}

/**
 * Returns all records
 *
 * @param {*} limit Max limit
 * @returns {Promise}
 */
OData.prototype.findAll = function (limit) {
  return new Promise((resolve, reject) => {
    this.count()
      .then((count) => {
        // If the limit is less than records count,
        // returns the count of the limit
        limit = limit && limit < count ? limit : count

        // Get the next batch
        this._findNext(limit, [], (err, result) => {
          if (err) {
            return reject(err)
          }

          resolve({
            data: result
          })
        })
      })
      .catch(reject)
  })
}

/**
 * Returns record by primary key
 *
 * @param {*} key
 * @returns {Promise}
 */
OData.prototype.findByID = function (key) {
  return new Promise((resolve, reject) => {
    this._getInstance()
      .then((inst) => {
        // odata call
        inst
          .find(modelUtils.resolveKey(this.name, key))
          .get()
          .then((res) => {
            resolve({
              data: this._getData(res)
            })
          })
          .fail(this._handleNotFoundError.bind(this, resolve, reject, null))
      })
      .catch(reject)
  })
}

/**
 * Returns a distinct result set based on the field(s).
 *
 * @param {Object} Model
 * @param {string} field
 * @param {Object} options
 * @returns {Promise}
 */
OData.prototype.distinct = function (Model, field, options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    const fieldSel = {}
    fieldSel[field] = 1
    options.sel = fieldSel

    this.query(Model, options)
      .then((res) => {
        // Returns the uniq properties from the result by field name
        const distinctValues = R.compose(
          R.uniq,
          R.map((item) => {
            return item[field]
          })
        )(this._getData(res))

        resolve(distinctValues)
      })
      .catch(reject)
  })
}

/**
 * Performs query
 *
 * @param {Object} Model
 * @param {Object} options
 * @returns {Promise}
 */
OData.prototype.query = function (Model, options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    const inst = o(this._resolveUrl())

    // Apply query options and returns selected fields if sel
    // or unsel options has being specified
    var select = this._applyQueryOptions(Model, inst, options)

    this._getInstance(select, inst)
      .then((inst) => {
        inst
          .get()
          .then((result) => {
            resolve({
              data: this._getData(result)
            })
          })
          .fail(reject)
      })
  })
}

/**
 * Performs delete by id
 *
 * @param {*} key
 * @returns {Promise}
 */
OData.prototype.deleteOne = function (key) {
  return new Promise((resolve, reject) => {
    const inst = o(this._resolveUrl())
    this._setIfMatchHeader(inst)

    inst
      .find(modelUtils.resolveKey(this.name, key))
      .remove()
      .save((res) => {
        const data = this._getData(res)
        resolve({
          affectedRows: data ? 1 : 0
        })
      }, (status, res) => {
        this._handleNotFoundError(resolve, reject, {
          affectedRows: 0
        }, res)
      })
  })
}

/**
 * Performs delete all
 *
 * @returns {Promise}
 */
OData.prototype.deleteAll = function () {
  return new Promise((resolve, reject) => {
    this.count()
      .then((count) => {
        // Delete next batch
        this._deleteNext(count, 0, (err, result) => {
          if (err) {
            return reject(err)
          }

          resolve(result)
        })
      })
      .catch(reject)
  })
}

/**
 * Performs remote function call over api call
 *
 * @param {Object} params
 * @returns {Promise}
 */
OData.prototype.execute = function (params) {
  return new Promise((resolve, reject) => {
    const resolvedParams = this._resolveFnParams(params)

    o(`${this._resolveUrl()}${resolvedParams}`)
      .get()
      .then((res) => {
        resolve({
          data: this._getData(res)
        })
      })
      .fail(reject)
  })
}

/**
 * Creates new odata item plus navigation props(models relations)
 *
 * @param {*} data
 * @returns
 */
OData.prototype.create = function (data) {
  return new Promise((resolve, reject) => {
    const refData = modelUtils.pickRefData(this.name, data)

    this._post(data)
      .then((result) => {
        if (!result || !result.data) {
          return resolve(result)
        }

        const key = modelUtils.getPK(this.name, result.data)
        // Check if there are navigation fields which have to be save
        if (key && Object.keys(refData).length) {
          // Add item's navigation fields
          this._manageRefs('ADD', key, refData)
            .then((refsResult) => {
              resolve({
                data: Object.assign({}, result.data, refsResult)
              })
            })
            .catch(reject)
        } else {
          // return the created item instantly if it doesn't have navigation fields
          resolve(result)
        }
      })
      .catch(reject)
  })
}

/**
 * Returns odata items count
 *
 * @returns {number}
 */
OData.prototype.count = function () {
  return new Promise((resolve, reject) => {
    requestUtils.generateCountRequest(this.url, this.name)
      .then((res) => {
        resolve(res | 0)
      })
      .catch(reject)
  })
}

/**
 * Updates new odata item plus navigation props(models relations)
 *
 * @param {*} key
 * @param {Array} changedFields
 * @param {Object} payload
 * @returns {Promise}
 */
OData.prototype.update = function (key, changedFields, payload) {
  return new Promise((resolve, reject) => {
    const refData = this._getRefData(changedFields)
    const promises = [this._put(key, payload)]

    if (key && Object.keys(refData).length) {
      promises.push(this._updateRefs(key, refData))
    }

    Promise.all(promises)
      .then(() => {
        resolve({
          affectedRows: 1
        })
      })
      .catch(reject)
  })
}

/**
 * Creates new odata item
 *
 * @param {Object} data
 * @returns {Promise}
 */
OData.prototype._post = function (data) {
  return new Promise((resolve, reject) => {
    const mainFields = modelUtils.getMainFields(this.name)
    data = R.pick(mainFields, data)

    o(this._resolveUrl())
      .post(data)
      .save((res) => {
        resolve({
          data: this._getData(res)
        })
      }, (status, res) => {
        reject(res)
      })
  })
}

/**
 * Updates odata item
 *
 * @param {*} key
 * @param {Object} data
 * @returns
 */
OData.prototype._put = function (key, data) {
  return new Promise((resolve, reject) => {
    const mainFields = modelUtils.getMainFields(this.name)
    data = R.pick(mainFields, data)

    const inst = o(this._resolveUrl())
    this._setIfMatchHeader(inst)

    inst
      .find(modelUtils.resolveKey(this.name, key))
      .put(data)
      .save((res) => {
        resolve({
          data: this._getData(res)
        })
      }, (status, res) => {
        reject(res)
      })
  })
}

/**
 * Apply query options on odata instance - ($filter, $order, $skip, $top, $sel)
 *
 * @param {*} Model
 * @param {*} options
 * @returns {Array}
 */
OData.prototype._applyQueryOptions = function (Model, inst, options) {
  var select

  if (this._hasQueryOption('where', options)) {
    // Apply $filter to odata sdk instance
    this._where(options.where, inst)
  }

  if (this._hasQueryOption('order', options)) {
    // Apply $order to odata sdk instance
    this._order(options.order, inst)
  }

  if (this._hasQueryOption('sel', options)) {
    // Apply $sel to odata sdk instance
    select = this._sel(options.sel, inst)
  } else if (this._hasQueryOption('unsel', options)) {
    // Apply $sel to odata sdk instance
    select = this._unsel(options.unsel, Model, inst)
  }

  if (this._hasQueryOption('skip', options) || this._hasQueryOption('limit', options)) {
    // Apply $skip and $top to odata sdk instance
    this._filterBySkipAndLimit(options, inst)
  } else if (this._hasQueryOption('page', options) && this._hasQueryOption('per_page', options)) {
    // Apply $skip and $top to odata sdk instance
    this._filterByPageAndPerPage(options, inst)
  }

  return select
}

/**
 * Set specific headers required for delete operations over odata
 *
 * @param {Object} inst
 */
OData.prototype._setIfMatchHeader = function (inst) {
  inst.oConfig.headers = [{ name: 'If-Match', value: '*' }]
}

/**
 * Returns odata request url
 *
 * @returns
 */
OData.prototype._resolveUrl = function () {
  return `${this.url}${this.name}`
}

/**
 * Prepares api req params to be used in odata request url and returns them
 *
 * @param {Object} params
 * @returns {string}
 */
OData.prototype._resolveFnParams = function (params) {
  if (!params || !Object.keys(params).length) {
    return ''
  }

  return Object.keys(params).reduce((res, paramName) => {
    if (res.length !== 1) {
      res += ','
    }
    res += `${paramName}=${params[paramName]}`
    return res
  }, '(') + ')'
}

/**
 * Find items recursively - If the service limits the returned items from
 * the getAll request, this method will try to get all of them as soon as
 * it reaches the limit specified with param
 *
 * @param {number} limit
 * @param {Array} items
 * @param {Function} next
 * @returns
 */
OData.prototype._findNext = function (limit, items, next) {
  if (items.length === limit) {
    return next(null, items)
  }

  this._getInstance()
    .then((inst) => {
      inst
        .skip(items.length)
        .get()
        .then((res) => {
          const data = this._getData(res)
          if (data) {
            items = items.concat(data)
          }

          this._findNext(limit, items, next)
        })
        .fail(next)
    })
}

/**
 * Returns the data from the service response
 *
 * @param {Object} res
 * @returns {Object}
 */
OData.prototype._getData = function (res) {
  if (!res) {
    return null
  }
  return res.data ? res.data : res
}

/**
 * Delte odata items by primary keys
 *
 * @param {Array} ids
 * @returns {Promise}
 */
OData.prototype._deleteByKeys = function (ids) {
  return new Promise((resolve, reject) => {
    async.each(ids, (key, callback) => {
      this.deleteOne(key)
        .then(() => {
          callback()
        })
        .catch(callback)
    }, (err) => {
      if (err) {
        return reject(err)
      }

      resolve(ids.length)
    })
  })
}

/**
 * Deletes all items
 *
 * @param {number} deleted
 * @param {Function} next
 */
OData.prototype._deleteNext = function (count, deleted, next) {
  if (!count || count === deleted) {
    return next(null, { affectedRows: deleted })
  }

  o(this._resolveUrl())
    .get()
    .then((res) => {
      const ids = R.map(modelUtils.getPK(this.name), this._getData(res))

      this._deleteByKeys(ids)
        .then((lastDeleted) => {
          this._deleteNext(count, deleted + lastDeleted, next)
        })
        .catch(next)
    })
    .fail(next)
}

/**
 * Returns odata model's instance
 *
 * @param {Array} select
 * @param {Object} inst
 * @returns {Promise}
 */
OData.prototype._getInstance = function (select, inst) {
  return new Promise((resolve, reject) => {
    inst = inst || o(this._resolveUrl())

    if (modelUtils.hasRefFields(this.name)) {
      const expandUrl = requestUtils.generateExpandFieldsString(this.name, select)
      if (expandUrl) {
        inst.expand(expandUrl)
      }
    }

    resolve(inst)
  })
}

/**
 * Checks if the options contains specified query option
 *
 * @param {Object} optionName
 * @param {Object} options
 * @returns {boolean}
 */
OData.prototype._hasQueryOption = function (optionName, options) {
  return R.hasIn(optionName, options)
}

/**
 * Applies odata where $filter based on where option
 *
 * @param {Object} where
 * @param {Object} inst
 * @returns {string}
 */
OData.prototype._where = function (where, inst) {
  if (!where) {
    return
  }

  var filter = Object.keys(where).reduce((str, key) => {
    return utils.translateWhereToQuery(where, str, key)
  }, '')

  if (filter !== '') {
    inst.filter(filter)
  }
}

/**
 * Applies odata $order filter based on order option
 *
 * @param {Object} order
 * @param {Object} inst
 */
OData.prototype._order = function (order, inst) {
  R.mapObjIndexed((value, key) => {
    value = +value
    var order = value === -1 ? 'desc' : 'asc'
    inst.orderBy(`${key}`, `${order}`)
  }, order)
}

/**
 * Applies odata $sel filter based on sel option
 *
 * @param {Object} obj
 * @param {Object} inst
 * @returns {Array}
 */
OData.prototype._sel = function (sel, inst) {
  const pkName = modelUtils.getPKName(this.name)
  const selFieldsNames = Object.keys(sel)
    .filter((field) => {
      return sel[field] === 1
    })

  if (!R.contains(pkName, selFieldsNames)) {
    selFieldsNames.push(pkName)
  }

  inst.select(selFieldsNames.join(','))

  return selFieldsNames
}

/**
 * Applies odata $sel filter based on unsel option
 *
 * @param {Object} unsel
 * @param {Object} Model
 * @param {Object} inst
 * @returns {Array}
 */
OData.prototype._unsel = function (unsel, Model, inst) {
  const pkName = modelUtils.getPKName(this.name)
  var unselFieldsNames = Object.keys(unsel)
    .filter((field) => {
      return unsel[field] === 1
    })

  var selFieldsNames = R.difference(Object.keys(Model.fields), unselFieldsNames)

  if (!R.contains(pkName, selFieldsNames)) {
    selFieldsNames.push(pkName)
  }

  inst.select(selFieldsNames.join(','))

  return selFieldsNames
}

/**
 * Applies $skip and $top filters based on page and perPage option
 *
 * @param {Object} options
 * @param {Object} inst
 * @returns
 */
OData.prototype._filterByPageAndPerPage = function (options, inst) {
  var skipNum = (options.page - 1) * options.per_page
  var takeNum = options.per_page
  inst.skip(skipNum).take(takeNum)
}

/**
 * Applies $skip and $top filters based on skip and limit option
 *
 * @param {Object} options
 * @param {Object} inst
 * @returns
 */
OData.prototype._filterBySkipAndLimit = function (options, inst) {
  R.has('skip', options) && inst.skip(options.skip)
  R.has('limit', options) && inst.take(options.limit)
}

/**
 * Extracts the navigations properties data from item data
 *
 * @param {Object} model
 * @returns {Object}
 */
OData.prototype._getRefData = function (model) {
  const updatedRefsFields = R.compose(
    R.intersection(modelUtils.getRefFields(this.name)),
    R.keys
  )(model)

  return R.pick(updatedRefsFields, model)
}

/**
 * Updates odata item navigations properties
 *
 * @param {*} key
 * @param {Object} refData
 * @returns
 */
OData.prototype._updateRefs = function (key, refData) {
  return new Promise((resolve, reject) => {
    // TODO: Separate in functions
    this.findByID(key)
      .then((res) => {
        var origRefData = this._getRefData(res.data)
        const updatedRefFields = Object.keys(refData)
        origRefData = R.pick(updatedRefFields, origRefData)

        const refs = Object.keys(refData).reduce((res, key) => {
          const updatedRefs = utils.objectToArray(refData[key])
          const origRefs = utils.objectToArray(origRefData[key])

          res.addRefs[key] = R.difference(updatedRefs, origRefs)
          res.removeRefs[key] = R.difference(origRefs, updatedRefs)

          return res
        }, { addRefs: {}, removeRefs: {} })

        return Promise.resolve(refs)
      })
      .then((refs) => {
        return Promise.all([
          this._manageRefs('ADD', key, refs.addRefs),
          this._manageRefs('REMOVE', key, refs.removeRefs)
        ])
      })
      .then(resolve)
      .catch(reject)
  })
}

/**
 * Adds or removes odata item navigations properties
 *
 * @param {string} method
 * @param {*} key
 * @param {Object} refData
 * @returns {Promise}
 */
OData.prototype._manageRefs = R.curry(function (method, key, refData) {
  return new Promise((resolve, reject) => {
    var handler

    switch (method) {
      case 'ADD':
        // Add new nagigation properties to our odata item
        handler = requestUtils.generateAddRefRequest
        break
      case 'REMOVE':
        // Remove nagigation properties from our odata item
        handler = requestUtils.generateRemoveRefRequest
        break
    }

    const self = this
    // Send net request for every navigation prop which
    // should be added or removed from our odata item
    const promises = R.compose(
      R.flatten,
      R.map((refField) =>
        R.map((refKey) => {
          const refModelName = modelUtils.getRefModel(self.name, refField)
          refKey = modelUtils.getPK(refModelName, refKey)

          return handler(self.url, self.name, key, refModelName, refField, refKey)
        }, utils.objectToArray(refData[refField]))
      )
    )(Object.keys(refData))

    Promise.all(promises)
      .then(() => {
        resolve(refData)
      })
      .catch(reject)
  })
})

/**
 * Check if the error is - record not found
 * and returns empty result if it is
 *
 * @param {Object} resolve
 * @param {Object} reject
 * @param {Object} res
 */
OData.prototype._handleNotFoundError = function (resolve, reject, notFoundRes, res) {
  if (res && res.status === 404) {
    typeof notFoundRes !== 'undefined' ? resolve(notFoundRes) : resolve()
  } else {
    reject(res)
  }
}
