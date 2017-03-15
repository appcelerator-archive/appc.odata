'use strict'

const Arrow = require('arrow')
const R = require('ramda')

/**
 * Creates Arrow Model's instance from JSON
 *
 * @param {Object} Model
 * @param {Object} item
 * @returns
 */
const createModelFromPayload = module.exports.createModelFromPayload = function (Model, item) {
  const instance = Model.instance(item, true)
  instance.setPrimaryKey(this.getPK(getName(Model), item))

  return instance
}

const getName = module.exports.getName = function (Model) {
  var parent = Model
  while (parent._parent && parent._parent.name) {
    parent = parent._parent
  }
  var modelName = parent.name || Model._supermodel || Model.name
  modelName = modelName.split('/').pop()
  return modelName
}

/**
 * Creates Array of Arrow Model's instances
 *
 * @param {Object} Model
 * @param {Object} items
 * @returns
 */
module.exports.createCollectionFromPayload = function (Model, items) {
  return new Arrow.Collection(Model, items.map((item) => {
    return createModelFromPayload.call(this, Model, item)
  }))
}

/**
 * Returns true if the model has navigation properties
 *
 * @param {string} modelName
 * @returns {boolean}
 */
module.exports.hasRefFields = function (modelName) {
  const Model = Arrow.getModel(modelName)
  return Object.keys(Model.fields).some(function (prop) {
    return !!Model.fields[prop].model
  })
}

/**
 * Returns the primary key column name of a model
 *
 * @param {string} name
 * @returns {string}
 */
const getPKName = module.exports.getPKName = function (name) {
  return 'id'
}

/**
 * Returns true if the model has primary key column
 *
 * @param {string} name
 * @returns {boolean}
 */
module.exports.hasPKColumn = function (name) {
  return !!getPKName(name)
}

/**
 * Returns true if the primary key's value has being changed
 * from the original value
 *
 * @param {string} name
 * @param {Object} instance
 * @returns {boolean}
 */
module.exports.isPKUpdated = function (name, instance) {
  const pkName = getPKName(name)
  if (!pkName || !instance) {
    return false
  }

  if (typeof instance.getChangedFields === 'function') {
    var updated = instance.getChangedFields()
    if (!updated) {
      return false
    }

    return updated[pkName]
  } else {
    return instance[pkName]
  }
}

/**
 * Returns primary key's value
 *
 * @param {string} name
 * @param {Object} item
 * @returns {*}
 */
module.exports.getPK = R.curry(function (name, item) {
  return typeof item === 'object' ? item[getPKName(name)] : item
})

/**
 * Returns primary key's field type
 *
 * @param {string} name
 * @param {*} key
 * @returns {string}
 */
const getPKFieldType = module.exports.getPKFieldType = function (name, key) {
  return typeof key
}

/**
 * Returns the name of the model's fields
 * except the navigation fields
 *
 * @param {string} modelName
 * @returns {Array}
 */
module.exports.getMainFields = function (modelName) {
  const Model = Arrow.getModel(modelName)
  return Object.keys(Model.fields).filter(function (prop) {
    return !Model.fields[prop].model
  })
}

/**
 * Returns the name of the model's navigation fields
 *
 * @param {string} modelName
 * @returns {Array}
 */
const getRefFields = module.exports.getRefFields = function (modelName) {
  const Model = Arrow.getModel(modelName)
  return Object.keys(Model.fields).filter(function (prop) {
    return Model.fields[prop].model
  })
}

/**
 * Returns the name of the primary key
 * of the model which is related to specified
 * navigation property by some other model
 *
 * @param {string} modelName
 * @param {string} refField
 * @returns {string}
 */
module.exports.getModelKeyFieldName = function (modelName, refField) {
  return getPKName()
}

/**
 * Returns model's field original type if exists
 *
 * @param {string} modelName
 * @param {string} refField
 * @returns {string}
 */
const getFieldModelName = module.exports.getFieldModelName = function (modelName, refField) {
  const fields = Arrow.getModel(modelName).fields
  return R.path([refField, 'model'], fields)
}

/**
 * Returns model's name by navigation property field's name
 *
 * @param {string} modelName
 * @param {string} refField
 * @returns {string}
 */
module.exports.getRefModel = function (modelName, refField) {
  return Arrow.pluralize(getFieldModelName(modelName, refField))
}

/**
 * Extracts and returns navigation property fields item
 *
 * @param {string} modelName
 * @param {Object} item
 * @returns {Object}
 */
module.exports.pickRefData = function (modelName, item) {
  const refFields = getRefFields(modelName)
  return R.compose(
    R.filter((refColl) => !!refColl),
    R.pick(refFields)
  )(item)
}

/**
 * Prepares primary key value to be used in odata request url and returns it
 *
 * @param {string} name
 * @param {string} key
 * @returns {string}
 */
module.exports.resolveKey = function (name, key) {
  return getPKFieldType(name, key) === 'string' ? `'${key}'` : `${key}`
}
