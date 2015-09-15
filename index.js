
var Busboy = require('co-busboy')
var rimraf = require('rimraf')
var path = require('path')
var cp = require('fs-cp')
var fs = require('mz/fs')
var os = require('os')

var slice = [].slice

module.exports = function* (req, options) {
  options = options || {}
  options.autoFields = true

  var tmp = options.tmp || os.tmpdir()
  var folder = path.join(tmp, uid())

  yield fs.mkdir(folder)

  var parts = Busboy(req, options)
  var obj = new Output(folder)

  var part
  while (part = yield parts) {
    if (!part.filename)
      part.filename = uid()

    part.path = path.join(folder, part.filename)
    obj.file[part.filename] = part
    obj.files.push(part)
    yield cp(part, part.path)
  }

  obj.field = parts.field
  obj.fields = parts.fields

  return obj
}

function Output(folder) {
  this.file = {}
  this.files = []
  this.field = {}
  this.fields = []
  this.path = folder
}

Output.prototype.rimraf =
Output.prototype.dispose = function dispose(cb) {
  rimraf(this.path, cb || noop)
}

function uid() {
  return Math.random().toString(36).slice(2)
}

function noop() {}
