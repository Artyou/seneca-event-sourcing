'use strict'

var SourcedEntity = require('./lib/sourced_entity')

module.exports = function () {
  return {
    name: 'seneca-event-sourcing'
  }
}

module.exports.preload = function () {
  var seneca = this
  var sd = seneca.delegate()

  SourcedEntity.prototype.private$ = { seneca: sd }

  return {
    name: 'seneca-event-sourcing'
  }
}

module.exports.SourcedEntity = SourcedEntity
