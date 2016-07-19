'use strict'

const MakeSourced = require('./lib/make_sourced')

module.exports = function () {
  return {
    name: 'seneca-event-sourcing'
  }
}

module.exports.preload = function () {
  var seneca = this
  var sd = seneca.delegate()

  // Template entity that makes all others.
  seneca.private$.sourced_entity = seneca.private$.sourced_entity || MakeSourced({}, sd)

  function api_make_sourced () {
    var self = this
    var args = arrayify(arguments)
    args.unshift(self)
    return seneca.private$.sourced_entity.make$.apply(seneca.private$.sourced_entity, args)
  }

  seneca.decorate('make_sourced$', api_make_sourced)
  seneca.decorate('make_sourced', api_make_sourced)

  return {
    name: 'seneca-event-sourcing'
  }
}

function arrayify () {
  return Array.prototype.slice.call(arguments[0], arguments[1])
}
