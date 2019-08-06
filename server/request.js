var global = require('./global.js')

module.exports = {
  getPCDASCII: function (req, res, next) {
    console.log(req.headers['content-type'])

    const { readFileSync } = require('fs')

    const obj = readFileSync('ascii.pcd', 'utf8')
    res.setHeader('content-type', 'application/octet-stream')
    res.send(obj)
    // console.log(global.folder_id_map)
  },
  getPCDBinary: function (req, res, next) {
    console.log(req.headers['content-type'])

    const { readFileSync } = require('fs')

    const obj = readFileSync('binary.pcd', 'binary')
    res.setHeader('content-type', 'application/octet-stream')
    res.send(obj)
    // console.log(global.folder_id_map)
  }
}
