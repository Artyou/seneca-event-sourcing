'use strict'
const Seneca = require('seneca')
const Entity = require('seneca-entity')
const EventSourcing = require('..')
const SourcedEntity = require('../src/lib/sourced_entity')
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

test('should have a seneca instance', function (t) {
  var si = SenecaInstance()
  var entity = new SourcedEntity()
  t.true(entity.private$.seneca)
  t.end()
  si.close()
})
