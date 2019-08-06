/// /////////////////
// INCLUDE
const Express = require('express')
const CORS = require('cors')
const { Spawn } = require('child_process')

const Request = require('./request.js')

/// /////////////////
// GLOBAL VARIABLE
var global = require('./global.js')
var config = require('./config.js')

function initServer () {
  global.app = Express()
  global.app.use(CORS())
  // global.app.use(express.static('public'))

  global.server = global.app.listen(config.port, () => {
    console.log('Node.js is listening to PORT:' + global.server.address().port)
  })
}

function initRequest () {
  global.app.get('/api/ascii', Request.getPCDASCII)
  global.app.get('/api/binary', Request.getPCDBinary)
}

if (require.main === module) {
  main()
}

function main () {
  initServer()
  initRequest()
}
