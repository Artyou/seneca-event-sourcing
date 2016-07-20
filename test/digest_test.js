'use strict'

const Seneca = require('seneca')
const _ = require('lodash')
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

  seneca.add('role:test,cmd:some-command', function (args, done) {
    var entity = args.entity || seneca.make_sourced('test')
    entity.property2 = args.data
    entity.digest('some-command', args.data)
    done(null, {entity: entity})
  })

  return seneca
}

test('should wrap param object with command matching calling command name and add to array of newEvents', function (t) {
  var si = SenecaInstance()

  var data = {data: {test: 'data'}}
  si.act('role:test,cmd:some-command', data, function (err, response) {
    if (err) return t.fail(err)
    t.equal(response.entity.newEvents.length, 1)
    t.equal(response.entity.newEvents[0].command, 'some-command')
    t.equal(response.entity.newEvents[0].data, data.data)
    t.true(response.entity.newEvents[0].timestamp, 'show have a timestamp')
    t.end()
    si.close()
  })
})

test('should have versions 1 and 2 for two consecutively digested events', function (t) {
  var si = SenecaInstance()

  var data = {data: {test: 'data'}}
  var data2 = {data: {test: 'data2'}}

  si.act('role:test,cmd:some-command', data, function (err, response1) {
    if (err) return t.fail(err)
    data2.entity = response1.entity
    si.act('role:test,cmd:some-command', data2, function (err, response2) {
      if (err) return t.fail(err)
      t.equal(response2.entity.newEvents.length, 2)
      t.equal(response2.entity.newEvents[0].command, 'some-command')
      t.equal(response2.entity.newEvents[0].data, data.data)
      t.equal(response2.entity.newEvents[1].command, 'some-command')
      t.equal(response2.entity.newEvents[1].data, data2.data)
      t.equal(response2.entity.version, 2)
      t.end()
      si.close()
    })
  })
})
