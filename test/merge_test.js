'use strict'

const Seneca = require('seneca')
const Stub = require('seneca-stub')
const Entity = require('seneca-entity')
const EventSourcing = require('..')
const test = require('tape')

function SenecaInstance () {
  var seneca = Seneca({
    log: 'silent',
    default_plugins: {
      entity: false,
      'mem-store': false
    },
    plugins: [Entity, EventSourcing]
  })

  return seneca
}

function TestEntity (si) {
  var entity = si.make_sourced('test')
  entity.property = false
  entity.property2 = {
    subProperty: false,
    subProperty2: true
  }
  return entity
}

test('should merge a snapshot into the current snapshot, overwriting any common properties', function (t) {
  var si = SenecaInstance()
  var entity = TestEntity(si)

  var snapshot = {
    property: true,
    property2: true
  }

  entity.merge(snapshot)

  t.true(entity.property)
  t.true(entity.property2)
  t.end()
  si.close()
})

test('should merge a complex snapshot (missing newly added fields) while maintaining defaulted sub-object values', function (t) {
  var si = SenecaInstance()
  var entity = TestEntity(si)

  var snapshot = {
    property: true
  }

  entity.merge(snapshot)

  t.true(entity.property)
  t.false(entity.property2.subProperty)
  t.true(entity.property2.subProperty2)
  t.end()
  si.close()
})

test('should merge a complex snapshot while maintaining defaulted sub-object values', function (t) {
  var si = SenecaInstance()
  var entity = TestEntity(si)

  var snapshot = {
    property: true,
    property2: {
      subProperty: true,
      subProperty2: false
    }
  }
  entity.merge(snapshot)

  t.true(entity.property)
  t.true(entity.property2.subProperty)
  t.false(entity.property2.subProperty2)
  t.end()
  si.close()
})
