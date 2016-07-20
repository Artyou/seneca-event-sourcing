'use strict'

var Common = require('./common')
var async = require('async')
var _ = require('lodash')
var util = require('util')

function EntityError (msg, constr) {
  Error.captureStackTrace(this, constr || this)
  this.message = msg || 'Entity Error'
}

util.inherits(EntityError, Error)

EntityError.prototype.name = 'EntityError'

function SourcedEntity (name, seneca) {
  var self = this

  self.log$ = function () {
    this.private$.seneca.log.apply(this, arguments)
  }

  var private$ = self.private$ = function () {}

  private$.seneca = seneca

  private$.entity_name = name

  this.newEvents = []

  this.eventsToEmit = []
  this.replaying = false
  this.snapshotVersion = 0
  this.timestamp = Date.now()
  this.version = 0
  // var args = Array.prototype.slice.call(arguments)
  // if (args[0]) {
  //   var snapshot = args[0]
  //   this.merge(snapshot)
  // }
  // if (args[1]) {
  //   var evnts = args[1]
  //   this.replay(evnts)
  // }
}

SourcedEntity.prototype.make$ = function () {
  var self = this
  var args = Common.arrayify(arguments)

  if (args[0] && args[0].seneca) {
    self.private$.seneca = args.shift()
  }

  if (!args[0]) {
    throw new EntityError('Entity name should be provided.')
  }

  var entity = new SourcedEntity(args[0], self.private$.seneca)
  return entity
}

SourcedEntity.prototype.enqueue = function enqueue () {
  if (!this.replaying) {
    this.eventsToEmit.push(arguments)
  }
}

SourcedEntity.prototype.digest = function digest (command, data) {
  if (!this.replaying) {
    this.timestamp = Date.now()
    this.version = this.version + 1
    this.log$(util.format('digesting command \'%s\' w/ data %j', command, data))
    this.newEvents.push({
      command: command,
      data: data,
      timestamp: this.timestamp,
      version: this.version
    })
  }
}

SourcedEntity.prototype.replay = function replay (events, done) {
  var self = this

  this.replaying = true

  self.log$(util.format('replaying events %j', events))
  var fns = _.map(events, function (event) {
    return function (callback) {
      var pattern = util.format('role:%s,cmd:%s', self.private$.entity_name, event.command)
      var data = _.merge({fatal$: false, entity: self}, event.data)
      self.private$.seneca.act(pattern, data, function (err) {
        if (err) return callback(err)
        self.version = event.version
        return callback(null)
      })
    }
  })
  async.series(fns, function (err) {
    if (err) {
      self.log$(err)
      return done(err)
    }
    self.replaying = false
    return done(null, {entity: self})
  })
}

SourcedEntity.prototype.snapshot = function snapshot () {
  this.snapshotVersion = this.version
  var snap = _.cloneDeep(this, true)
  return this.trimSnapshot(snap)
}

SourcedEntity.prototype.trimSnapshot = function trimSnapshot (snapshot) {
  delete snapshot.eventsToEmit
  delete snapshot.newEvents
  delete snapshot.replaying
  delete snapshot._events
  delete snapshot._maxListeners
  delete snapshot.domain
  return snapshot
}

module.exports = function make_entity (canon, seneca) {
  // handle_options(seneca.options().entity || {})
  // toString_map[''] = make_toString()
  return new SourcedEntity(canon, seneca)
}

module.exports.SourcedEntity = SourcedEntity
