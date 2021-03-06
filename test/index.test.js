var co = require('co')
var fs = require('fs')
var path = require('path')
var Stream = require('stream')
var assert = require('assert')
var rimraf = require('rimraf')

var multipart = require('../')

describe('Co Multipart', function () {
  var parts

  it('should parse', function () {
    return co(function* () {
      parts = yield* multipart(request())

      assert.equal(parts.fields.length, 3)
      assert.equal(Object.keys(parts.field).length, 2)
      assert.equal(parts.files.length, 3)
      assert.equal(Object.keys(parts.file).length, 3)
    })
  })

  it('should save files', function () {
    // make sure the files exist
    parts.files.forEach(function (file) {
      fs.statSync(file.path)
    })
  })

  it('should dispose files', function (done) {
    parts.dispose(function (err) {
      if (err)
        return done(err)

        // make sure the files are deleted
      parts.files.forEach(function (file) {
        try {
          fs.statSync(file.path)
          throw new Error()
        } catch (err) {
          assert.equal(err.code, 'ENOENT')
        }
      })

      done()
    })
  })

  it('should not overwrite prototypes', function () {
    assert.equal(parts.field.hasOwnProperty, Object.prototype.hasOwnProperty)
  })

  it('should custom tmp dir', function () {
    var tmpdir = path.join(__dirname, '.tmp')
    if (!fs.existsSync(tmpdir)) {
      fs.mkdirSync(tmpdir)
    }
    return co(function* () {
      var parts = yield* multipart(request(), {
        tmp: tmpdir
      })

      assert.equal(parts.fields.length, 3)
      assert.equal(Object.keys(parts.field).length, 2)
      assert.equal(parts.files.length, 3)
      assert.equal(Object.keys(parts.file).length, 3)
      parts.files.forEach(function (file) {
        assert.equal(file.path.indexOf(tmpdir), 0)
      })

      rimraf.sync(tmpdir)
    })
  })
})

function request() {
  // https://github.com/mscdex/busboy/blob/master/test/test-types-multipart.js

  var stream = new Stream.PassThrough()

  stream.headers = {
    'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
  }

  stream.end([
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="file_name_0"',
    '',
    'super alpha file',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="file_name_1"',
    '',
    'super beta file',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="hasOwnProperty"',
    '',
    'super bad file',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
    'Content-Type: application/octet-stream',
    '',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file_1"; filename="1k_b.dat"',
    'Content-Type: application/octet-stream',
    '',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="image"; filename=""',
    '',
    'empty filename',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--',
  ].join('\r\n'))

  return stream
}
