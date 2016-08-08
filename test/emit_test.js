'use strict'

const Seneca = require('seneca')
const SenecaStub = require('seneca-stub')
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
    plugins: [EventSourcing]
  })

  SenecaStub(seneca)

  return seneca
}

test('should not emit if events doesnt have a dot', function (t) {
  SenecaInstance()
  var entity = new SourcedEntity()

  t.throws(() => entity.emit('someevent'), /Events should be queued in object\.event format\./)
  t.end()
})

test('emit should call a seneca pattern', function (t) {
  var si = SenecaInstance()
  var entity = new SourcedEntity()

  var stub = si.stub({role: 'events', some: 'event'}, {ok: true})
  entity.emit('some.event')
  setTimeout(() => {
    t.true(stub.calledOnce)
    t.end()
    si.close()
  }, 111)
})
