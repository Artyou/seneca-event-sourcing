'use strict'

var Common = require('./common')
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
    // use this, as make$ will have changed seneca ref
    this.private$.seneca.log.apply(this, arguments)
  }

  var private$ = self.private$ = function () {}

  private$.seneca = seneca

  private$.entity_name = name

  this.newEvents = []

  this.eventsToEmit = []
  // this.replaying = false
  // this.snapshotVersion = 0
  // this.timestamp = Date.now()
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

SourcedEntity.prototype.digest = function digest (method, data) {
  if (!this.replaying) {
    // this.timestamp = Date.now()
    this.version = this.version + 1
    this.log$(util.format('digesting event \'%s\' w/ data %j', method, data))
    this.newEvents.push({
      method: util.format('role:%s,event:%s', this.private$.entity_name, method),
      data: data,
      //timestamp: this.timestamp,
      version: this.version
    })
  }
}

SourcedEntity.prototype.replay = function replay (events) {
  var self = this

  this.replaying = true

  self.log$(util.format('replaying events %j', events))

  events.forEach(function (event) {
    if (self[event.method]) {
      self[event.method](event.data)
      self.version = event.version
    } else {
      var errorMessage = util.format('method \'%s\' does not exist on model \'SourcedEntity\'', event.method)
      self.log$(errorMessage)
      throw new EntityError(errorMessage)
    }
  })

  this.replaying = false
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
