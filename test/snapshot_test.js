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

test('should return object with current state of the entity', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  var data = { data: 'data' }

  entity.property2 = data.data
  entity.digest('some-event', data)

  var snapshot = entity.snapshot()

  t.equal(snapshot.property2, data.data)
  t.equal(snapshot.snapshotVersion, 1)
  t.equal(snapshot.version, 1)
  t.end()
  si.close()
})
