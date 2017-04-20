'use strict'

const test = require('tap').test
const sinon = require('sinon')
const Arrow = require('arrow')

const modelUtils = require('../../../utils/modelUtils')

test('### Should create model from payload ###', sinon.test(function (t) {
  const Model = {
    instance: this.stub(),
    name: 'test',
    metadata: {}
  }
  const getModelStub = this.stub()
  getModelStub.returns(Model)

  this.stub(Arrow, 'getModel', getModelStub)
  const itemStub = {
    id: 1,
    setPrimaryKey: this.spy()
  }
  Model.instance.returns(itemStub)

  const instance = modelUtils.createModelFromPayload(Model, itemStub)

  t.ok(instance)
  t.ok(Model.instance.calledOnce)
  t.ok(Model.instance.calledWith(itemStub, true))
  t.ok(instance.setPrimaryKey.calledOnce)
  t.ok(instance.setPrimaryKey.calledWith(1))
  t.end()
}))

test('### Should create model from payload if there is a dublicate ###', sinon.test(function (t) {
  const Model = {
    instance: this.stub(),
    name: 'test',
    fields: {
      Age: {},
      NameID: {}
    },
    metadata: {
      primarykey: 'Name',
      'appc.odata': {
        primarykey: 'NameID'
      }
    }
  }
  const getModelStub = this.stub()
  getModelStub.returns(Model)

  this.stub(Arrow, 'getModel', getModelStub)
  const itemStub = {
    Name: 1,
    Age: 45,
    setPrimaryKey: this.spy(),
    getPrimaryKey: this.stub().returns(1)
  }
  Model.instance.returns(itemStub)

  const instance = modelUtils.createModelFromPayload(Model, itemStub)

  t.ok(instance)
  t.ok(Model.instance.calledOnce)
  t.ok(Model.instance.calledWith(itemStub, true))
  t.ok(instance.setPrimaryKey.calledOnce)
  t.ok(instance.setPrimaryKey.calledWith(1))
  t.ok(instance.getPrimaryKey.calledOnce)

  t.end()
}))

test('### Should get proper parent model for models that have _parent ###', sinon.test(function (t) {
  const Model = {
    instance: this.stub(),
    name: 'test',
    _parent: {
      name: 'testParent',
      _parent: {
        name: 'testParent2'
      }
    }
  }
  const getName = modelUtils.getName(Model)
  t.ok(getName)
  t.equals(getName, 'testParent2')
  t.end()
}))

test('### Should get proper super model for models ###', sinon.test(function (t) {
  const Model = {
    instance: this.stub(),
    _supermodel: 'supermodel'
  }
  const getName = modelUtils.getName(Model)
  t.ok(getName)
  t.equals(getName, 'supermodel')
  t.end()
}))

test('### Should create collection from payload ###', sinon.test(function (t) {
  const Model = {
    instance: this.stub(),
    name: 'test',
    metadata: {}
  }
  const getModelStub = this.stub()
  getModelStub.returns(Model)
  this.stub(Arrow, 'getModel', getModelStub)

  const setPrimaryKeyStub = this.spy()
  const itemsStub = [{
    id: 1,
    setPrimaryKey: setPrimaryKeyStub
  }, {
    id: 2,
    setPrimaryKey: setPrimaryKeyStub
  }]
  Model.instance.onCall(0).returns(itemsStub[0])
  Model.instance.onCall(1).returns(itemsStub[0])

  const ArrowCollectionMock = (function () {
    function ArrowCollectionMock () { }
    return ArrowCollectionMock
  })()

  const arrowCollectionSpy = this.spy(function () {
    return sinon.createStubInstance(ArrowCollectionMock)
  })

  this.stub(Arrow, 'Collection', arrowCollectionSpy)

  const instance = modelUtils.createCollectionFromPayload(Model, itemsStub)

  t.ok(instance)
  t.ok(Model.instance.calledTwice)
  t.ok(setPrimaryKeyStub.calledTwice)
  t.ok(arrowCollectionSpy.calledOnce)

  t.end()
}))

test('### Should returns true if the model has navigation properties ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      name: {
        model: 'People'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const hasRefFields = modelUtils.hasRefFields('test')

  t.ok(hasRefFields)

  t.end()
}))

test('### Should returns false if the model hasn\'t navigation properties ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      name: {}
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const hasRefFields = modelUtils.hasRefFields('test')

  t.notOk(hasRefFields)

  t.end()
}))

test('### Should returns pk field name ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const pkName = modelUtils.getPKName(modelStub.name)

  t.ok(pkName)
  t.equal(pkName, 'id')

  t.end()
}))

test('### Should returns true if has pk column ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const hasPKColumn = modelUtils.hasPKColumn(modelStub.name)

  t.ok(hasPKColumn)

  t.end()
}))

test('### Should returns true if the pk of the item is being updated ###', sinon.test(function (t) {
  var item = {
    getChangedFields: sinon.stub()
  }
  item.getChangedFields.returns({ id: 5 })
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const isPKUpdated = modelUtils.isPKUpdated('test', item)

  t.ok(isPKUpdated)

  t.end()
}))

test('### Should returns false if the instance is not specified ###', sinon.test(function (t) {
  var item = {
    getChangedFields: sinon.stub()
  }
  item.getChangedFields.returns({ id: 5 })
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const isPKUpdated = modelUtils.isPKUpdated('test')

  t.notOk(isPKUpdated)

  t.end()
}))

test('### Should return false if the pk of the item is not updated and getChangedFields is a function ###', sinon.test(function (t) {
  var item = {
    getChangedFields: sinon.stub()
  }
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  item.getChangedFields.returns()

  const isPKUpdated = modelUtils.isPKUpdated('test', item)

  t.false(isPKUpdated)

  t.end()
}))

test('### Should return pk of the item when getChangedFields is not a function ###', sinon.test(function (t) {
  var item = {
    id: 50
  }
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const isPKUpdated = modelUtils.isPKUpdated('test', item)

  t.ok(isPKUpdated)
  t.equals(isPKUpdated, 50)

  t.end()
}))

test('### Should returns true if the pk of the item is not being updated ###', sinon.test(function (t) {
  var item = {
    getChangedFields: sinon.stub()
  }
  item.getChangedFields.returns({ count: 5 })
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const isPKUpdated = modelUtils.isPKUpdated('test', item)

  t.notOk(isPKUpdated)

  t.end()
}))

test('### Should returns pk value ###', sinon.test(function (t) {
  var item = {
    id: 4
  }
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const pk = modelUtils.getPK('test', item)

  t.ok(pk)
  t.equal(pk, 4)

  t.end()
}))

test('### Should returns pk value ###', sinon.test(function (t) {
  var item = 4
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    metadata: {
      primaryKey: 'id'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const pk = modelUtils.getPK('test', item)

  t.ok(pk)
  t.equal(pk, 4)

  t.end()
}))

test('### Should returns the pk field type by value ###', sinon.test(function (t) {
  const pkFieldType = modelUtils.getPKFieldType('test', 5)

  t.ok(pkFieldType)
  t.equal(pkFieldType, 'number')

  t.end()
}))

test('### Should returns the main fields of a model ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      name: {},
      person: {
        model: 'People'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const mainFields = modelUtils.getMainFields('test')

  t.ok(mainFields)
  t.equal(mainFields.length, 1)
  t.equal(mainFields[0], 'name')

  t.end()
}))

test('### Should returns the main fields of a model with dublicates ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    instance: this.stub(),
    name: 'test',
    fields: {
      Age: {},
      NameID: {}
    },
    metadata: {
      primarykey: 'Name',
      'appc.odata': {
        primarykey: 'NameID'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const mainFields = modelUtils.getMainFields('test')

  t.ok(mainFields)
  t.equal(mainFields.length, 2)
  t.equal(mainFields[0], 'Age')
  t.equal(mainFields[1], 'NameID')

  t.end()
}))

test('### Should returns the ref fields of a model ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      name: {},
      person: {
        model: 'People'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const mainFields = modelUtils.getRefFields('test')

  t.ok(mainFields)
  t.equal(mainFields.length, 1)
  t.equal(mainFields[0], 'person')

  t.end()
}))

test('### Should returns ref pk field name ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      person: {
        model: 'People'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const modelName = modelUtils.getFieldModelName('test', 'person')

  t.ok(modelName)
  t.equal(modelName, 'People')

  t.end()
}))

test('### Should returns ref model name pluralized ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      person: {
        model: 'User'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const modelName = modelUtils.getRefModel('test', 'person')

  t.ok(modelName)
  t.equal(modelName, 'Users')

  t.end()
}))

test('### Should returns only the ref props from item ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    fields: {
      name: {},
      person: {
        model: 'People'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)

  const refFields = modelUtils.pickRefData('test', {
    name: 'xxx',
    person: {
      name: 'yyy'
    }
  })

  t.ok(refFields)
  t.ok(refFields.person)
  t.notOk(refFields.name)
  t.equal(refFields.person.name, 'yyy')

  t.end()
}))

test('### Should resolve key ###', sinon.test(function (t) {
  const resolved = modelUtils.resolveKey('test', 5)

  t.ok(resolved)
  t.equal(resolved, '5')

  t.end()
}))

test('### Should check if the model has dublicate keys or not ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    fields: {
      Age: {},
      NameID: {}
    },
    metadata: {
      primarykey: 'Name'
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)
  const dublicate = modelUtils.checkDublicate('test')

  t.notOk(dublicate)
  t.end()
}))

test('### Should check if the model has dublicate keys or not ###', sinon.test(function (t) {
  const getModelStub = this.stub()
  const modelStub = {
    name: 'test',
    fields: {
      Age: {},
      NameID: {}
    },
    metadata: {
      primarykey: 'Name',
      'appc.odata': {
        primarykey: 'NameID'
      }
    }
  }
  getModelStub.returns(modelStub)

  this.stub(Arrow, 'getModel', getModelStub)
  const dublicate = modelUtils.checkDublicate('test')

  t.ok(dublicate)
  t.equals(dublicate, 'NameID')
  t.end()
}))
