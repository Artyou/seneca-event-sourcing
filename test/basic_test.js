'use strict'
const Seneca = require('seneca')
const Entity = require('seneca-entity')
const EventSourcing = require('..')
const SourcedEntity = require('../src/lib/make_sourced').SourcedEntity
const test = require('tape')

var SenecaInstance = function () {
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

test('should have decorated seneca with the make_sourced method', function (t) {
  var si = SenecaInstance()
  t.true(si.make_sourced)
  t.end()
  si.close()
})

test('should have an entity name', function (t) {
  var si = SenecaInstance()
  t.throws(si.make_sourced, /Entity name should be provided\./)
  t.end()
})

test('should return a SourcedEntity', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')
  t.true(entity instanceof SourcedEntity)
  t.end()
})
