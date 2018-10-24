'use strict'

const R = require('ramda')

const test = require('tap').test
const sinon = require('sinon')
const oMocks = require('../../oMocks')

const server = require('../../server')
const requestUtils = require('../../../utils/requestUtils')
const modelUtils = require('../../../utils/modelUtils')
const utils = require('../../../utils/utils')
var arrow

const OData = require('../../../utils/OData')

const getMainUrlStub = sinon.stub(utils, 'getMainUrl').callsFake((url) => {
  return 'http://localhost/'
})

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst
      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### Should create OData factory ###', function (t) {
  const factory = OData(null, { url: 'http://localhost' })
  t.ok(factory)
  t.type(factory, 'function')
  t.ok(getMainUrlStub.notCalled)

  getMainUrlStub.resetHistory()
  t.end()
})

test('### Should create OData instance ###', function (t) {
  const inst = OData(null, { url: 'http://localhost/Categories' })('Categories')
  t.ok(inst)
  t.type(inst, 'object')
  t.ok(getMainUrlStub.calledOnce)

  getMainUrlStub.resetHistory()
  t.end()
})

test('### findAll Call - Error Case ###', function (t) {
  const generateCountRequestStub = sinon.stub(requestUtils, 'generateCountRequest').callsFake((url, modelName) => {
    return Promise.resolve(6)
  })

  const hasRefFieldsStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName) => {
    return false
  })

  const skipSpy = sinon.spy()
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()

  const o = oMocks({ skipSpy, getSpy, expandSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').findAll()
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(skipSpy.calledOnce)
      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.notCalled)

      t.ok(generateCountRequestStub.calledOnce)
      t.ok(hasRefFieldsStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      hasRefFieldsStub.restore()
      getMainUrlStub.resetHistory()
      generateCountRequestStub.restore()
      hasRefFieldsStub.restore()

      t.end()
    })
})

test('### findAll Call - Ok Case ###', function (t) {
  const skipSpy = sinon.spy()
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()

  const hasRefFieldsStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName) => {
    const Model = arrow.getModel(modelName)
    return Model.metadata && Model.metadata['appc.odata'] ? Model.metadata['appc.odata'].refFields : false
  })

  const generateCountRequestStub = sinon.stub(requestUtils, 'generateCountRequest').callsFake((url, modelName) => {
    return Promise.resolve(6)
  })

  const o = oMocks({ skipSpy, getSpy, expandSpy }, { getResult: { data: [{}, {}, {}] } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').findAll()
    .then((result) => {
      t.ok(result)
      t.ok(result.data)
      t.equal(result.data.length, 6)

      t.ok(skipSpy.calledTwice)
      t.ok(getSpy.calledTwice)
      t.ok(expandSpy.notCalled)

      t.ok(generateCountRequestStub.calledOnce)
      t.ok(hasRefFieldsStub.calledTwice)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      hasRefFieldsStub.restore()
      generateCountRequestStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### findByID Call - Error Case ###', function (t) {
  const expandSpy = sinon.spy()
  const findSpy = sinon.spy()
  const getSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const resolveKeyStub = sinon.stub(modelUtils, 'resolveKey').callsFake((name, key) => {
    return `${key}`
  })

  const o = oMocks({ findSpy, getSpy, expandSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').findByID(123)
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(findSpy.calledOnce)
      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(resolveKeyStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      resolveKeyStub.restore()
      generateExpandFieldsStringStub.restore()
      resolveKeyStub.restore()
      hasRefFieldslStub.restore()

      t.end()
    })
})

test('### findByID Call - Ok Case ###', function (t) {
  const findSpy = sinon.spy()
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const resolveKeyStub = sinon.stub(modelUtils, 'resolveKey').callsFake((name, key) => {
    return `${key}`
  })

  const o = oMocks({ findSpy, getSpy, expandSpy }, { getResult: { data: {} } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').findByID(123)
    .then((result) => {
      t.ok(result)
      t.ok(result.data)
      t.type(result.data, 'object')

      t.ok(findSpy.calledOnce)
      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)
      t.ok(findSpy.calledWith('123'))

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(resolveKeyStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      resolveKeyStub.restore()
      generateExpandFieldsStringStub.restore()
      resolveKeyStub.restore()
      hasRefFieldslStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### distinct Call - Error Case ###', function (t) {
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()
  const selectSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((name) => {
    return `id`
  })

  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return false
  })

  const o = oMocks({ getSpy, expandSpy, selectSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').distinct({}, 'Name')
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)
      t.ok(selectSpy.calledOnce)

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(getPKNameStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)
      t.ok(checkDublicateStub.calledTwice)

      getMainUrlStub.resetHistory()
      checkDublicateStub.restore()
      generateExpandFieldsStringStub.restore()
      hasRefFieldslStub.restore()
      getPKNameStub.restore()

      t.end()
    })
})

test('### distinct Call - Ok Case ###', function (t) {
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()
  const selectSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((name) => {
    return `id`
  })

  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return 'NameID'
  })

  const o = oMocks({ getSpy, expandSpy, selectSpy }, { getResult: { data: {} } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').distinct({}, 'Name')
    .then((result) => {
      t.ok(result)

      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)
      t.ok(selectSpy.calledOnce)
      t.equal(selectSpy.firstCall.args[0], 'Name,id')

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(getPKNameStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)
      t.ok(checkDublicateStub.calledTwice)

      getMainUrlStub.resetHistory()
      checkDublicateStub.restore()
      generateExpandFieldsStringStub.restore()
      hasRefFieldslStub.restore()
      getPKNameStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### distinct Call - Ok Case ###', function (t) {
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()
  const selectSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((name) => {
    return `Name`
  })

  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return 'NameID'
  })

  const o = oMocks({ getSpy, expandSpy, selectSpy }, { getResult: { data: {} } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').distinct({}, 'NameID')
    .then((result) => {
      t.ok(result)

      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)
      t.ok(selectSpy.calledOnce)
      t.equal(selectSpy.firstCall.args[0], 'Name')

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(getPKNameStub.calledTwice)
      t.ok(checkDublicateStub.calledTwice)

      checkDublicateStub.restore()
      generateExpandFieldsStringStub.restore()
      hasRefFieldslStub.restore()
      getPKNameStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### query Call - Error Case ###', function (t) {
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const o = oMocks({ getSpy, expandSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').query({})
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(getMainUrlStub.calledTwice)

      getMainUrlStub.resetHistory()
      generateExpandFieldsStringStub.restore()
      hasRefFieldslStub.restore()

      t.end()
    })
})

test('### query Call - Ok Case ###', function (t) {
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const o = oMocks({ getSpy, expandSpy }, { getResult: { data: {} } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').query({})
    .then((result) => {
      t.ok(result)

      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      generateExpandFieldsStringStub.restore()
      hasRefFieldslStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### query Call - Ok Case with option $eq ###', function (t) {
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()
  const filterSpy = sinon.spy()
  const orderBySpy = sinon.spy()
  const selectSpy = sinon.spy()
  const skipSpy = sinon.spy()
  const takeSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const translateWhereToQueryStub = sinon.stub(utils, 'translateWhereToQuery').callsFake((where, str, key) => {
    return `(${key} eq ${where[key].$eq})`
  })
  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return false
  })

  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((name) => {
    return 'id'
  })

  const o = oMocks({ getSpy, expandSpy, filterSpy, orderBySpy, selectSpy, skipSpy, takeSpy }, { getResult: { data: {} } })

  const options = {
    per_page: 2,
    page: 1,
    sel: {
      Name: 1
    },
    order: {
      Name: -1
    },
    where: {
      Name: {
        $eq: 'TestName'
      }
    }
  }

  OData(o, { url: 'http://localhost/Categories' })('Categories').query({}, options)
    .then((result) => {
      t.ok(result)

      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)
      t.ok(filterSpy.calledOnce)
      t.ok(orderBySpy.calledOnce)
      t.ok(selectSpy.calledOnce)
      t.ok(skipSpy.calledOnce)
      t.ok(takeSpy.calledOnce)

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(getPKNameStub.calledOnce)
      t.ok(translateWhereToQueryStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)
      t.ok(checkDublicateStub.calledOnce)

      getMainUrlStub.resetHistory()
      checkDublicateStub.restore()
      generateExpandFieldsStringStub.restore()
      hasRefFieldslStub.restore()
      getPKNameStub.restore()
      translateWhereToQueryStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### query Call - Ok Case with option $gt ###', function (t) {
  const getSpy = sinon.spy()
  const expandSpy = sinon.spy()
  const filterSpy = sinon.spy()
  const orderBySpy = sinon.spy()
  const selectSpy = sinon.spy()
  const skipSpy = sinon.spy()
  const takeSpy = sinon.spy()

  const generateExpandFieldsStringStub = sinon.stub(requestUtils, 'generateExpandFieldsString').callsFake((modelName, select) => {
    return 'Categories'
  })

  const hasRefFieldslStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName, select) => {
    return true
  })

  const translateWhereToQueryStub = sinon.stub(utils, 'translateWhereToQuery').callsFake((where, str, key) => {
    return `(${key} gt ${where[key].$gt})`
  })

  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((name) => {
    return 'id'
  })

  const o = oMocks({ getSpy, expandSpy, filterSpy, orderBySpy, selectSpy, skipSpy, takeSpy }, { getResult: { data: {} } })
  const options = {
    limit: 2,
    skip: 1,
    unsel: {
      Name: 1
    },
    order: {
      Name: 1
    },
    where: {
      UnitPrice: {
        $gt: 20
      }
    }
  }

  const Model = {
    fields: []
  }

  OData(o, { url: 'http://localhost/Categories' })('Categories').query(Model, options)
    .then((result) => {
      t.ok(result)

      t.ok(getSpy.calledOnce)
      t.ok(expandSpy.calledOnce)
      t.ok(filterSpy.calledOnce)
      t.ok(orderBySpy.calledOnce)
      t.ok(selectSpy.calledOnce)
      t.ok(skipSpy.calledOnce)
      t.ok(takeSpy.calledOnce)

      t.ok(generateExpandFieldsStringStub.calledOnce)
      t.ok(hasRefFieldslStub.calledOnce)
      t.ok(getPKNameStub.calledOnce)
      t.ok(translateWhereToQueryStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      generateExpandFieldsStringStub.restore()
      hasRefFieldslStub.restore()
      getPKNameStub.restore()
      translateWhereToQueryStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### deleteOne Call - Error Case ###', function (t) {
  const saveSpy = sinon.spy()
  const findSpy = sinon.spy()
  const removeSpy = sinon.spy()

  const resolveKeyStub = sinon.stub(modelUtils, 'resolveKey').callsFake((name, key) => {
    return `${key}`
  })

  const o = oMocks({ saveSpy, findSpy, removeSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').deleteOne(123)
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(saveSpy.calledOnce)
      t.ok(findSpy.calledOnce)
      t.ok(removeSpy.calledOnce)

      t.ok(resolveKeyStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      resolveKeyStub.restore()
      resolveKeyStub.restore()

      t.end()
    })
})

test('### deleteOne Call - Ok Case ###', function (t) {
  const saveSpy = sinon.spy()
  const findSpy = sinon.spy()
  const removeSpy = sinon.spy()

  const resolveKeyStub = sinon.stub(modelUtils, 'resolveKey').callsFake((name, key) => {
    return `${key}`
  })

  const o = oMocks({ saveSpy, findSpy, removeSpy }, { saveResult: { data: {} } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').deleteOne(123)
    .then((result) => {
      t.ok(result)
      t.type(result.affectedRows, 'number')

      t.ok(saveSpy.calledOnce)
      t.ok(findSpy.calledOnce)
      t.ok(findSpy.calledWith('123'))
      t.ok(removeSpy.calledOnce)

      t.ok(resolveKeyStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      resolveKeyStub.restore()
      resolveKeyStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### deleteAll Call - Error Case ###', function (t) {
  const getSpy = sinon.spy()

  const generateCountRequestStub = sinon.stub(requestUtils, 'generateCountRequest').callsFake((url, modelName) => {
    return Promise.resolve(6)
  })

  const o = oMocks({ getSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').deleteAll()
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(getSpy.calledOnce)

      t.ok(generateCountRequestStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      generateCountRequestStub.restore()

      t.end()
    })
})

test('### deleteAll Call - Ok Case ###', function (t) {
  const getSpy = sinon.spy()
  const findSpy = sinon.spy()
  const removeSpy = sinon.spy()
  const saveSpy = sinon.spy()

  const generateCountRequestStub = sinon.stub(requestUtils, 'generateCountRequest').callsFake((url, modelName) => {
    return Promise.resolve(6)
  })

  const getPKStub = sinon.stub(modelUtils, 'getPK').callsFake(R.curry((name, key) => {
    return 0
  }))

  const resolveKeyStub = sinon.stub(modelUtils, 'resolveKey').callsFake((name, key) => {
    return `${key}`
  })

  const o = oMocks({ getSpy, findSpy, removeSpy, saveSpy }, { saveResult: { data: {} }, getResult: { data: [{}, {}, {}] } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').deleteAll()
    .then((result) => {
      t.ok(result)
      t.type(result.affectedRows, 'number')

      t.ok(getSpy.calledTwice)
      t.equal(findSpy.callCount, 6)
      t.equal(removeSpy.callCount, 6)
      t.equal(saveSpy.callCount, 6)

      t.ok(generateCountRequestStub.calledOnce)
      t.ok(getPKStub.calledTwice)
      t.equal(resolveKeyStub.callCount, 6)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      generateCountRequestStub.restore()
      getPKStub.restore()
      resolveKeyStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### execute Call - Error Case ###', function (t) {
  const getSpy = sinon.spy()

  const o = oMocks({ getSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').execute()
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(getSpy.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      t.end()
    })
})

test('### execute Call - Ok Case ###', function (t) {
  const getSpy = sinon.spy()

  const o = oMocks({ getSpy }, { getResult: { data: {} } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').execute()
    .then((result) => {
      t.ok(result)

      t.ok(getSpy.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      t.end()
    })
    .catch(t.threw)
})

test('### create Call - Error Case ###', function (t) {
  const saveSpy = sinon.spy()
  const postSpy = sinon.spy()

  const getMainFieldsStub = sinon.stub(modelUtils, 'getMainFields').callsFake((modelName, select) => {
    return []
  })

  const pickRefDataStub = sinon.stub(modelUtils, 'pickRefData').callsFake((modelName, select) => {
    return []
  })
  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return false
  })

  const o = oMocks({ saveSpy, postSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').create({})
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(saveSpy.calledOnce)
      t.ok(postSpy.calledOnce)

      t.ok(getMainFieldsStub.calledOnce)
      t.ok(pickRefDataStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)
      t.ok(checkDublicateStub.calledOnce)

      getMainUrlStub.resetHistory()
      checkDublicateStub.restore()
      getMainFieldsStub.restore()
      pickRefDataStub.restore()

      t.end()
    })
})

test('### create Call - Ok Case ###', function (t) {
  const saveSpy = sinon.spy()
  const postSpy = sinon.spy()

  const getMainFieldsStub = sinon.stub(modelUtils, 'getMainFields').callsFake((modelName, select) => {
    return []
  })

  const pickRefDataStub = sinon.stub(modelUtils, 'pickRefData').callsFake((modelName, select) => {
    return []
  })

  const getPKStub = sinon.stub(modelUtils, 'getPK').callsFake((name, key) => {
    return 123
  })

  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return false
  })

  const o = oMocks({ saveSpy, postSpy }, { saveResult: { data: {} } })

  OData(o, { url: 'http://localhost/Categories' })('Categories').create({})
    .then((result) => {
      t.ok(result)
      t.ok(result.data)
      t.type(result.data, 'object')

      t.ok(saveSpy.calledOnce)
      t.ok(postSpy.calledOnce)

      t.ok(getMainFieldsStub.calledOnce)
      t.ok(pickRefDataStub.calledOnce)
      t.ok(getPKStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)
      t.ok(checkDublicateStub.calledOnce)

      getMainUrlStub.resetHistory()
      checkDublicateStub.restore()
      getMainFieldsStub.restore()
      pickRefDataStub.restore()
      getPKStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### count Call - Error Case ###', function (t) {
  const generateCountRequestStub = sinon.stub(requestUtils, 'generateCountRequest').callsFake((url, modelName) => {
    return Promise.reject(new Error('Fail'))
  })

  OData(null, { url: 'http://localhost/Categories' })('Categories').count()
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(generateCountRequestStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      generateCountRequestStub.restore()

      t.end()
    })
})

test('### count Call - Ok Case ###', function (t) {
  const generateCountRequestStub = sinon.stub(requestUtils, 'generateCountRequest').callsFake((url, modelName) => {
    return Promise.resolve(6)
  })

  OData(null, { url: 'http://localhost/Categories' })('Categories').count()
    .then((result) => {
      t.ok(result)
      t.type(result, 'number')
      t.equal(result, 6)

      t.ok(generateCountRequestStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)

      getMainUrlStub.resetHistory()
      generateCountRequestStub.restore()

      t.end()
    })
    .catch(t.threw)
})

test('### update Call - Error Case ###', function (t) {
  const findSpy = sinon.spy()
  const putSpy = sinon.spy()
  const saveSpy = sinon.spy()

  const getRefFieldsStub = sinon.stub(modelUtils, 'getRefFields').callsFake((modelName, select) => {
    return []
  })

  const getMainFieldsStub = sinon.stub(modelUtils, 'getMainFields').callsFake((modelName, select) => {
    return []
  })

  const resolveKeyStub = sinon.stub(modelUtils, 'resolveKey').callsFake((name, key) => {
    return `${key}`
  })
  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((modelName) => {
    return 'id'
  })
  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return false
  })

  const o = oMocks({ findSpy, putSpy, saveSpy }, { fail: true })

  OData(o, { url: 'http://localhost/Categories' })('Categories').update({})
    .then(t.threw)
    .catch((err) => {
      t.ok(err)
      t.ok(err.message)
      t.equal(err.message, 'Fail')

      t.ok(findSpy.calledOnce)
      t.ok(putSpy.calledOnce)
      t.ok(saveSpy.calledOnce)

      t.ok(getMainFieldsStub.calledOnce)
      t.ok(getRefFieldsStub.calledOnce)
      t.ok(resolveKeyStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)
      t.ok(getPKNameStub.calledOnce)
      t.ok(checkDublicateStub.calledOnce)

      getMainUrlStub.resetHistory()
      checkDublicateStub.restore()
      getPKNameStub.restore()
      getRefFieldsStub.restore()
      getMainFieldsStub.restore()
      resolveKeyStub.restore()

      t.end()
    })
})

test('### update Call - Ok Case ###', function (t) {
  const changedFields = {
    id: '777f2baa12eaebabec4af28e',
    Name: 'UpdatedName',
    Category: '578f2baa12eaebabec4af28e'
  }

  const getRefFieldsStub = sinon.stub(modelUtils, 'getRefFields').callsFake((modelName, select) => {
    return ['Category']
  })

  const getMainFieldsStub = sinon.stub(modelUtils, 'getMainFields').callsFake((modelName, select) => {
    return []
  })

  const resolveKeyStub = sinon.stub(modelUtils, 'resolveKey').callsFake((name, key) => {
    return `${key}`
  })

  const objectToArrayStub = sinon.stub(utils, 'objectToArray').callsFake((obj) => {
    if (!obj) {
      return []
    }

    return [`${obj}`]
  })

  const getPKStub = sinon.stub(modelUtils, 'getPK').callsFake((name, key) => {
    return `${key}`
  })

  const generateAddRefRequestStub = sinon.stub(requestUtils, 'generateAddRefRequest').callsFake((url, modelName, key, refModel, refField, refKey) => {
    return {}
  })

  const generateRemoveRefRequestStub = sinon.stub(requestUtils, 'generateRemoveRefRequest').callsFake((url, modelName, key, refModel, refField, refKey) => {
    return {}
  })
  const hasRefFieldsStub = sinon.stub(modelUtils, 'hasRefFields').callsFake((modelName) => {
    const Model = arrow.getModel(modelName)
    return Model.metadata && Model.metadata['appc.odata'] ? Model.metadata['appc.odata'].refFields : false
  })
  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((modelName) => {
    return 'id'
  })
  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return false
  })
  const getRefModelStub = sinon.stub(modelUtils, 'getRefModel').callsFake((modelName) => {
    return 'Category'
  })

  const o = oMocks({}, { getResult: { data: {} }, saveResult: { data: {} } })

  OData(o, { url: 'http://localhost/Products' })('Products').update(changedFields.Category, changedFields, {})
    .then((result) => {
      t.ok(result)
      t.type(result.affectedRows, 'number')

      t.ok(getMainFieldsStub.calledOnce)
      t.ok(getRefFieldsStub.calledTwice)
      t.ok(resolveKeyStub.calledTwice)
      t.ok(getPKStub.calledTwice)
      t.equal(objectToArrayStub.callCount, 4)
      t.ok(generateAddRefRequestStub.calledOnce)
      t.ok(generateRemoveRefRequestStub.calledOnce)
      t.ok(hasRefFieldsStub.calledOnce)
      t.ok(getMainUrlStub.calledOnce)
      t.ok(getPKNameStub.calledOnce)
      t.ok(getRefModelStub.calledTwice)
      t.ok(checkDublicateStub.calledOnce)

      getMainUrlStub.resetHistory()
      checkDublicateStub.restore()
      getRefModelStub.restore()
      getPKNameStub.restore()
      getMainFieldsStub.restore()
      getRefFieldsStub.restore()
      resolveKeyStub.restore()
      getPKStub.restore()
      hasRefFieldsStub.restore()
      objectToArrayStub.restore()
      generateAddRefRequestStub.restore()
      generateRemoveRefRequestStub.restore()

      t.end()
    })
    .catch((err) => {
      console.log(err)
    })
})

test('### _getPayload no dublicate ###', function (t) {
  const data = {
    Name: 'Name',
    Age: 45
  }
  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((name) => {
    return `id`
  })
  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return false
  })
  const o = oMocks({}, { getResult: { data: {} }, saveResult: { data: {} } })

  const payload = OData(o, { url: 'http://localhost/Products' })('Products')._getPayload(data, 'modelName')

  t.ok(getPKNameStub.calledOnce)
  t.ok(checkDublicateStub.calledOnce)
  t.ok(payload)
  t.deepequal(payload, data)

  checkDublicateStub.restore()
  getPKNameStub.restore()

  t.end()
})

test('### _getPayload with dublicate ###', function (t) {
  const data = {
    Age: 45,
    NameID: 'Name'
  }
  const payloadData = {
    Name: 'Name',
    Age: 45
  }
  const getPKNameStub = sinon.stub(modelUtils, 'getPKName').callsFake((name) => {
    return `Name`
  })
  const checkDublicateStub = sinon.stub(modelUtils, 'checkDublicate').callsFake((modelName) => {
    return 'NameID'
  })
  const o = oMocks({}, { getResult: { data: {} }, saveResult: { data: {} } })
  const payload = OData(o, { url: 'http://localhost/Products' })('Products')._getPayload(data, 'modelName')

  t.ok(getPKNameStub.calledOnce)
  t.ok(checkDublicateStub.calledOnce)
  t.ok(payload)
  t.deepequal(payload, payloadData)

  checkDublicateStub.restore()
  getPKNameStub.restore()

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
