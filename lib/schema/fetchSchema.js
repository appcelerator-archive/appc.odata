// 'use strict';

const request = require('request')
const fastXmlParser = require('fast-xml-parser')
const utils = require('../../utils/utils')

// Default export
exports.fetchSchema = function (next) {
  // Get odata service url
  var url = this.config.url
  url = utils.getMainUrl(url)

  // Fetch oData $metadata
  request.get(`${url}$metadata`, (err, res) => {
    if (err || (res && res.error)) {
      return next(err || (res ? res.error : 'Error'))
    }

    var parsed

    if (res && res.body) {
      try {
        // XML to JSON parser
        parsed = fastXmlParser.parse(res.body, {
          attrPrefix: '',
          ignoreNonTextNodeAttr: false,
          ignoreTextNodeAttr: false,
          ignoreNameSpace: false
        })
      } catch (e) {
        return next(e)
      }
    }

    if (parsed) {
      next(null, parsed)
    } else {
      next()
    }
  })
}
