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

test('should throw an entity error with name of model when attempting to replay a pattern an entity not handled', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  var events = [{
    command: 'some-command',
    data: { some: 'param' }
  }]
  entity.replay(events, function (err) {
    t.true(/No matching action pattern found for/.test(err))

    t.end()
    si.close()
  })
})

test('should call the command when replaying', function (t) {
  var si = SenecaInstance()
  Stub(si)
  var entity = si.make_sourced('test')

  var stub = si.stub({role: 'test', cmd: 'some-command'}, {ok: true})

  var events = [{
    command: 'some-command',
    data: { some: 'param' }
  }]
  entity.replay(events, function (err) {
    if (err) return t.fail(err)
    t.true(stub.calledOnce)

    t.end()
    si.close()
  })
})

test('should not enqueue events during replay', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  si.add({role: 'test', cmd: 'some-command'}, function (args, done) {
    var entity = args.entity || {}
    entity.some = args.some
    entity.enqueue('any-event-ed')
    done(null, {entity: entity})
  })

  var events = [{
    command: 'some-command',
    data: { some: 'param' }
  }]

  entity.replay(events, function (err) {
    if (err) return t.fail(err)
    t.equal(entity.eventsToEmit.length, 0)

    t.end()
    si.close()
  })
})

test('should call the command when replaying', function (t) {
  var si = SenecaInstance()
  var entity = si.make_sourced('test')

  si.add({role: 'test', cmd: 'some-command'}, function (args, done) {
    var entity = args.entity || {}
    entity.some = args.some
    done(null, {entity: entity})
  })

  var events = [{
    command: 'some-command',
    data: { some: 'param' }
  }]

  entity.replay(events, function (err) {
    if (err) return t.fail(err)
    t.equal(entity.some, events[0].data.some)

    t.end()
    si.close()
  })
})
