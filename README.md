# co multipart

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/co-multipart.svg?style=flat-square
[npm-url]: https://npmjs.org/package/co-multipart
[travis-image]: https://img.shields.io/travis/cojs/multipart.svg?style=flat-square
[travis-url]: https://travis-ci.org/cojs/multipart
[codecov-image]: https://codecov.io/github/cojs/multipart/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/cojs/multipart?branch=master
[david-image]: https://img.shields.io/david/cojs/multipart.svg?style=flat-square
[david-url]: https://david-dm.org/cojs/multipart
[download-image]: https://img.shields.io/npm/dm/co-multipart.svg?style=flat-square
[download-url]: https://npmjs.org/package/co-multipart

A [co-busboy](https://github.com/cojs/busboy)-based multipart parser using `co` or `koa` that saves files to disk.
Use this instead of **co-busboy** if you want to just download the files to disk and don't care about validating the fields before the downloading the files (i.e. validating the CSRF token).

- Open file descriptor limit - throttle the request so you don't use too many file descriptors!
- Easy disposal - Returns a `.dispose()` method to easily delete all the files yourself whenever you like.

## API

```js
var multipart = require('co-multipart')

app.use(function* (next) {
  var parts = yield* multipart(this)

  // do stuff with the body parts
  parts.files.forEach(function (file) {

  })

  // delete all the files when you're done
  parts.dispose()
})
```

### var parts = yield* multipart(request, [options])

`request` can be a raw node HTTP `req` or a Koa context.
`options`, other than those passed to [co-busboy](https://github.com/cojs/busboy), are:

- `tmp: os.tmpdir()` - File store tmp dir, default is the operating system's temp directory.

### parts.field, parts.fields

`parts.field` is an object to look up objects via name.
Ex. `var token = parts.field._csrf`.
`parts.fields` is an array with all fields as an array with the values:

    0. `fieldname`
    1. `value`
    2. `valueTruncated` - `Boolean`
    3. `fieldnameTruncated` - Boolean

### parts.file, parts.files

`parts.file` is an object to look up files via name.
`parts.files` is an array with all the files.
Each `file` is a `Readable Stream` with the properties:

    - `path` - where this file was saved
    - `fieldname`
    - `filename` - according to the client
    - `transferEncoding` or `encoding`
    - `mimeType` or `mime`

### parts.path

The temporary folder in which all the files are saved.

### parts.dispose()

Deletes all the files in this multipart request.

## License

The MIT License (MIT)

Copyright (c) 2013 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
