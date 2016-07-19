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

test('should wrap param object with method matching calling method name and add to array of newEvents', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  var data = { test: 'data' }

  entity.digest('some-event', data)
  t.equal(entity.newEvents.length, 1)
  t.equal(entity.newEvents[0].method, 'role:test,event:some-event')
  t.equal(entity.newEvents[0].data, data)
  t.end()
  si.close()
})

test('should have versions 1 and 2 for two consecutively digested events', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  var data = { test: 'data' }
  var data2 = {test: 'data2'}

  entity.digest('some-event', data)
  entity.digest('some-event', data2)

  t.equal(entity.newEvents.length, 2)
  t.equal(entity.newEvents[0].method, 'role:test,event:some-event')
  t.equal(entity.newEvents[0].data, data)
  t.equal(entity.newEvents[1].method, 'role:test,event:some-event')
  t.equal(entity.newEvents[1].data, data2)
  t.equal(entity.version, 2)
  t.end()
  si.close()
})
