'use strict'

const Seneca = require('seneca')
const Stub = require('seneca-stub')
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

test('emit should call the event pattern', function (t) {
  var si = SenecaInstance()
  Stub(si)
  var entity = si.make_sourced('test')
  var stub = si.stub({role: 'test', event: 'something.happened'}, {ok: true})
  entity.emit('something.happened', { data: 'data1' }, { data2: 'data2' })
  setTimeout(function () {
    t.true(stub.calledOnce)
    t.deepEqual(stub.data().data, [{ data: 'data1' }, { data2: 'data2' }])
    t.end()
    si.close()
  }, 111)
})

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
