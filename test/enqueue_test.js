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

test('should enqueue seneca patterns by adding them to array of patterns to call', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  entity.enqueue('something.happened', { data: 'data1' }, { data2: 'data2' })

  t.true(entity.eventsToEmit)
  t.equal(Array.prototype.slice.call(entity.eventsToEmit[0], 0, 1)[0], 'something.happened')
  t.equal(Array.prototype.slice.call(entity.eventsToEmit[0], 1)[0].data, 'data1')
  t.equal(Array.prototype.slice.call(entity.eventsToEmit[0], 1)[1].data2, 'data2')
  t.end()
  si.close()
})
