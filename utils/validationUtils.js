'use strict'

const Joi = require('joi')

module.exports.validateQuery = function (data) {
  var schema = Joi.object().keys({
    limit: Joi.number().integer().min(0).max(1000),
    skip: Joi.number().integer().min(0),
    where: Joi.object(),
    order: Joi.object(),
    sel: Joi.object(),
    unsel: Joi.object(),
    page: Joi.number().integer().min(1),
    per_page: Joi.number().integer().min(0)
  })

  return Joi.validate(data, schema).error
}
