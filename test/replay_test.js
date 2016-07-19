'use strict'

const Seneca = require('seneca')
const Entity = require('seneca-entity')
const EventSourcing = require('..')
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

test('should throw an entity error with name of model when attempting to replay a method an entity does not implement', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  var events = [{
    method: 'someMethod',
    data: { some: 'param' }
  }]
  t.throws(function () { entity.replay(events) }, new RegExp('\'someMethod\' does not exist on model \'SourcedEntity\''))

  t.end()
  si.close()
})
