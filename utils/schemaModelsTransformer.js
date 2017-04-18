'use strict'

const R = require('ramda')
const schemaUtils = require('./schemaUtils')
const utils = require('./utils')

const arrayToObject = schemaUtils.arrayToObject
const resolveName = schemaUtils.resolveName
const objectToArray = utils.objectToArray
const resolveType = schemaUtils.resolveType
const mixin = utils.mixin
const hasResource = schemaUtils.hasResource
const getResource = schemaUtils.getResource

/**
 * Default export
 * Transform odata $metadata to arrow model's schema
 *
 * @param {Object} connector
 * @param {Object} src
 * @returns {Object}
 */
module.exports = function (connector, src) {
  return R.compose(
    // Transform $metadata to arrow model's schema
    generateModelsSchema(connector),
    // Get schema data
    R.path(['edmx:Edmx', 'edmx:DataServices', 'Schema'])
  )(src)
}

/**
 * Generate model's schema from $metadata json
 *
 * @param {Object} connector
 * @returns {function}
 */
function generateModelsSchema (connector) {
  return (src) => {
    // Transform source collection
    var transformed = sourceSchemaTransform(src)

    // Generate models from entity containers $metadata
    const schema = entityContainersToModels(connector, transformed)

    // Returns the transformed schema
    return arrayToObject({ key: 'name' }, schema)
  }
}

/**
 * Transforms the schema data required for models generation
 *
 * @param {Object} src
 * @returns {Object}
 */
function sourceSchemaTransform (src) {
  return R.mapObjIndexed((currSrc, ns) => {
    return {
      entityContainers: objectToArray(currSrc.EntityContainer),
      entityTypes: arrayToObject({ ns: currSrc.Namespace, key: 'Name' }, currSrc.EntityType),
      complexTypes: arrayToObject({ ns: currSrc.Namespace, key: 'Name' }, currSrc.ComplexType),
      enumTypes: arrayToObject({ ns: currSrc.Namespace, key: 'Name' }, currSrc.EnumType),
      associations: arrayToObject({ ns: currSrc.Namespace, key: 'Name' }, currSrc.Association),
      ns: currSrc.Namespace
    }
  }, arrayToObject({ key: 'Namespace' }, src))
}

/**
 * Generate models from entity containers $metadata
 *
 * @param {Object} connector
 * @param {Array} transformed
 * @returns
 */
function entityContainersToModels (connector, transformed) {
  var schema = []
  R.mapObjIndexed((currSrc, ns, data) => {
    if (!R.isNil(R.prop(['entityContainers'], currSrc))) {
      // Public models and functions
      const entityContainers = objectToArray(currSrc.entityContainers)

      if (entityContainers && entityContainers.length) {
        R.forEach((entityContainer) => {
          // The real transformation
          const schemaModels = modelsTransform(ns, connector, data, entityContainer)
          schema = schema.concat(schemaModels)
        }, entityContainers)
      }
    }
  }, transformed)
  return schema
}

/**
 *  Transform model's $metadata to arrow models
 *
 * @param {string} ns
 * @param {Object} connector
 * @param {Object} src
 * @param {Object} entityContainer
 * @returns {Array}
 */
function modelsTransform (ns, connector, src, entityContainer) {
  // Transform the Models
  const entitySets = objectToArray(R.prop('EntitySet', entityContainer))
  const entitySetsSchema = entitySets.map(
    modelTransform(ns, connector, src, { methods: ['execute'] })
  ) || []

  // Transform the Singletons(Models)
  const singletons = objectToArray(R.prop('Singleton', entityContainer))
  const singletonsSchema = singletons.map(
    modelTransform(ns, connector, src, { actions: ['read'], disabledActions: ['findByID', 'findAll', 'count', 'distinct'] })
  ) || []

  return entitySetsSchema.concat(singletonsSchema)
}

/**
 * Transform json entity model schema to Arrow model schema
 *
 * @param {string} ns
 * @param {Object} connector
 * @param {Object} src
 * @param {Object} options
 * @param {Object} obj
 * @returns {Object}
 */
const modelTransform = R.curry(function (ns, connector, src, options, obj) {
  options = options || {}
  const modelName = resolveName(ns, obj.Name)

  const actions = options.actions
  const disabledActions = options.disabledActions

  // The model's $metadata
  const model = hasResource(['entityTypes'], src) && hasResource(['entityTypes', modelName], src)
    ? obj
    : getResource(['entityTypes', obj.EntityType || obj.Type], src)

  // Basic immutable model's schema
  var modelSchema = {
    name: obj.Name,
    connector,
    metadata: {}
  }

  // check if the key has StoreGeneratedPattern
  if (!checkPkGeneration(model)) {
    modelSchema = addDublicate(modelSchema, model)
  }

  // Arrow model's fields
  const fields = R.compose(
    R.map(generateField(src, { isForeign: false })),
    R.filter((prop) => { return prop.Name !== getPrimaryKeyName(model) })
  )(arrayToObject({ key: 'Name' }, model.Property))

  // Add fields to the model schema
  modelSchema = R.assocPath(['fields'], fields, modelSchema)

  // Set model allowed CRUD operations
  if (actions) {
    modelSchema = setActions(modelSchema, actions)
  }

  // Set model disabled CRUD operations
  if (disabledActions) {
    modelSchema = setDisabledActions(modelSchema, disabledActions)
  }

  // Set primary key if exists
  if (hasPrimaryKey(model)) {
    modelSchema = setPrimaryKey(modelSchema, model)
  }

  // Check for models relations
  if (hasRelations(model)) {
    objectToArray(model.NavigationProperty).forEach((navigationProp) => {
      modelSchema = setRelation(src, modelSchema, navigationProp)
    })
  }

  return modelSchema
})

/**
 * Check has primary key
 *
 * @param {Object} model
 * @returns {boolean}
 */
function hasPrimaryKey (model) {
  return R.has('Key', model)
}

/**
 * Extends model's schema with:
 * {
 *  metadata: {
 *    primarykey: {columnName}
 *  }
 * }
 *
 * @param {Object} modelSchema
 * @param {Object} model
 * @returns {Object}
 */
function setPrimaryKey (modelSchema, model) {
  return R.assocPath(['metadata', 'primarykey'], R.path(['Key', 'PropertyRef', 'Name'], model), modelSchema)
}

/**
 * Returns model's primary key
 *
 * @param {Object} model
 * @returns {Object}
 */
function getPrimaryKeyName (model) {
  return R.path(['Key', 'PropertyRef', 'Name'], model)
}

/**
 * Add fields which contains foreign key/keys
 *
 * @param {Object} src
 * @param {Object} modelSchema
 * @param {Object} prop
 * @returns {Object}
 */
const setRelation = R.curry(function (src, modelSchema, prop) {
  var field = generateField(src, { isForeign: true }, prop)
  return R.assocPath(['fields', prop.Name], field, modelSchema)
})

/**
 * Allowed models CRUD methods
 *
 * @param {Object} modelSchema
 * @param {Array} actions
 * @returns {Object}
 */
function setActions (modelSchema, actions) {
  return R.assocPath(['actions'], actions, modelSchema)
}

/**
 * Disable models CRUD methods
 *
 * @param {Object} modelSchema
 * @param {Array} disabledActions
 * @returns {Object}
 */
function setDisabledActions (modelSchema, disabledActions) {
  return R.assocPath(['disabledActions'], disabledActions, modelSchema)
}

/**
 * Generate Arrow model's field from entity model's field
 *
 * @param {Object} src
 * @param {Object} options
 * @param {Object} prop
 * @returns {Object}
 */
const generateField = R.curry(function (src, options, prop) {
  const isForeign = options.isForeign
  const required = options.required

  var field = {
    // Set type to Object if the prop is of complex type
    type: resolveType(src, { model: getRelationType(src, isForeign, prop), isForeign }),
    // Set required if it's not nullable
    required: (typeof required !== 'undefined' ? required : (isForeign ? false : prop.Nullable === 'false'))
  }

  if (isForeign) {
    // If this property is foreign key this property holds the related model's name
    field.model = resolveArrowModelName(src, getRelationType(src, isForeign, prop))
  }

  return field
})

/**
 * Check has relations between the models
 *
 * @param {Object} model
 * @returns {boolean}
 */
function hasRelations (model) {
  return R.has('NavigationProperty', model)
}

/**
 * Get the foreign model's name
 *
 * @param {Object} src
 * @param {boolean} isForeign
 * @param {Object} model
 * @returns {string}
 */
function getRelationType (src, isForeign, model) {
  const associations = mixin('associations', src)
  return isForeign && !model.Type ? associations[model.Relationship].End[0].Type : model.Type
}

/**
 * Returns the model's type for navigation properties
 *
 * @param {Object} src
 * @param {string} type
 * @returns {string}
 */
function resolveArrowModelName (src, type) {
  const entityTypes = mixin('entityTypes', src)

  var pattern = new RegExp(/^.+?(?:\((.+)\))?$/)
  var matches = pattern.exec(type).filter((match) => match !== undefined)

  return R.prop('Name', entityTypes[matches[matches.length - 1]])
}

/**
 * Checks if the primary key has a StoreGeneratedPattern
 * @param {Object} model
 *
 */
function checkPkGeneration (model) {
  const pkName = getPrimaryKeyName(model)
  const pkKeyProp = model.Property.filter(function (prop) {
    return prop.Name === pkName
  })
  return R.has('StoreGeneratedPattern', pkKeyProp)
}

/**
 * Add dublicate field for the primary key
 * @param {Object} Model schema
 * @param {Object} Model
 */
function addDublicate (modelSchema, model) {
  const pkName = getPrimaryKeyName(model)
  const pkKeyProp = model.Property.filter(function (prop) {
    return prop.Name === pkName
  })
  const field = {
    Name: pkName + 'ID',
    Type: pkKeyProp[0].Type,
    required: false
  }

  model.Property.push(field)
  modelSchema = R.assocPath(['metadata', 'appc.odata', 'primarykey'], field.Name, modelSchema)

  return modelSchema
}
