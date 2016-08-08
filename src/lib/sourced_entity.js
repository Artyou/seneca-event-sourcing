'use strict'

var Util = require('util')
var Entity = require('sourced').Entity

var Common = require('./common')

function SourcedEntity () {
  Entity.apply(this, arguments)
}
Util.inherits(SourcedEntity, Entity)

SourcedEntity.prototype.emit = function emit () {
  if (!this.replaying) {
    var args = Common.arrayify(arguments)
    var pattern = {role: 'events', fatal$: false}
    var event = args.shift()
    if (event.indexOf('.') === -1) throw Error('Events should be queued in object.event format.')

    var split = event.split('.')
    pattern[split[0]] = split[1]
    this.private$.seneca.act(pattern, {data: args})
  }
}

module.exports = SourcedEntity
