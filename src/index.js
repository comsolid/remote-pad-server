const pino = require('pino')()
const robot = require('./robot-race.js')
const mosca = require('mosca')

const http = require('http')
const httpServ = http.createServer()

const settings = {
    port: 1883
}

var server = new mosca.Server(settings)

server.attachHttpServer(httpServ)
httpServ.listen(1884)

server.on('ready', () => {
    pino.info(`Server is running at http://localhost:${settings.port}`)
})

// fired when a message is published
server.on('published', function(packet, client) {
    if (packet.topic === 'race/alice') {
        const commands = JSON.parse(packet.payload.toString())
        robot(commands)
    }
})
// fired when a client connects
server.on('clientConnected', function(client) {
    pino.info('Client Connected:', client.id)
})

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
    pino.info('Client Disconnected:', client.id)
})
