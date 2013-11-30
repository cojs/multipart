var fs = require('fs')
var os = require('os')
var path = require('path')
var archan = require('archan')
var Busboy = require('busboy')
var rimraf = require('rimraf')
var saveTo = require('save-to')

var slice = [].slice
var tmp = os.tmpdir()

module.exports = function* (req, options) {
  // KOA MAGIC SAUCE
  req = req.req || req
  options = options || {}
  options.headers = req.headers
  options.concurrency = options.concurrency || 2

  var ch = archan(options)

  var folder = path.join(tmp, uid())
  // lets pray there are no issues here
  yield fs.mkdir.bind(null, folder)

  var baby = new Busboy(options)
  var obj = new Output(folder)

  req.on('close', abort)

  baby
  .on('close', abort)
  .on('field', onField)
  .on('file', onFile)
  .on('error', onEnd)
  .on('end', onEnd)

  req.pipe(baby)

  var part
  while (part = yield* ch.read(true)) {
    // a file just got saved. yay!
    if (typeof part === 'string')
      continue
    yield* ch.drain()
    // it's a stream now
    part.path = path.join(folder, part.filename)
    saveTo(part, part.path, ch.push())
  }

  yield* ch.flush()

  return obj

  function onField() {
    var args = slice.call(arguments)
    obj.field[args[0]] = args[1]
    obj.fields.push(args)
  }

  function onFile(fieldname, file, filename, encoding, mimetype) {
    // opinionated, but 5 arguments is ridiculous
    file.fieldname = fieldname
    file.filename = filename
    file.transferEncoding = file.encoding = encoding
    file.mimeType = file.mime = mimetype
    obj.file[fieldname] = file
    obj.files.push(file)
    ch.push(file)
  }

  function onEnd(err) {
    cleanup()
    ch.push(err || null)
  }

  function abort() {
    cleanup()
    // noop? i dunno
    rimraf(folder, noop)
  }

  function cleanup() {
    req.removeListener('close', abort)
    baby.removeListener('close', abort)
    baby.removeListener('field', onField)
    baby.removeListener('file', onFile)
    baby.removeListener('error', onEnd)
    baby.removeListener('end', onEnd)
  }
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