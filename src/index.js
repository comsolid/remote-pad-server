const pino = require('pino')()
const robot = require('./robot-race.js')
const mosca = require('mosca')
const loadAuthorizer = require('./load-authorizer.js')

const http = require('http')
const httpServ = http.createServer()

const settings = {
    port: 1883,
    credentialsFile: 'credentials.json'
}

var server = new mosca.Server(settings)

server.attachHttpServer(httpServ)
httpServ.listen(1884)

server.on('ready', () => {
    loadAuthorizer(settings, function(err, authorizer) {
        if (err) {
            throw err
        }

        if (authorizer) {
            server.authenticate = authorizer.authenticate;
            server.authorizeSubscribe = authorizer.authorizeSubscribe;
            server.authorizePublish = authorizer.authorizePublish;
        }
    });
    pino.info(`Server is running at http://localhost:${settings.port}`)
})

const topics = [
    'alice',
    'bob'
]

// holds the id created by the mqtt on connect
let clients = {
    alice: 0,
    bob: 0
}

// fired when a message is published
server.on('published', function(packet, client) {
    topics.forEach(function (item) {
        const validUser = (client) ? client.id === clients[item] : false
        if (packet.topic === `race/${item}` && validUser) {
            const commands = JSON.parse(packet.payload.toString())
            robot(commands, item)
        }
    })
})

server.on('subscribed', function (topic, client) {
    pino.info(client.id, '-', client.user, 'subscribed to', topic)
})

// fired when a client connects
server.on('clientConnected', function(client) {
    if (clients[client.user] === 0) {
        pino.info('Client Connected:', client.id, '-', client.user)
        clients[client.user] = client.id
    } else {
        pino.warn('Client already connected', clients[client.user])
    }
})

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
    // only the same user can disconnect
    if (clients[client.user] === client.id) {
        pino.info('Client Disconnected:', client.id, '-', client.user)
        clients[client.user] = 0
    }
})

// Graceful Shutdown
process.on('SIGINT', function() {
    pino.info('Shutting down Mosca over WebSocket')
    httpServ.close(function() {
        pino.info('Shutting down Mosca')
        server.close(function () {
            process.exit()
        })
    })
})
