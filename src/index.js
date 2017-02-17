const pino = require('pino')()
const pad = require('./robot-pad.js')
const mosca = require('mosca')
const path = require('path')
const loadAuthorizer = require('./load-authorizer.js')
const Client = require('./client.js')

const http = require('http')
const httpServ = http.createServer()

const settings = {
    port: 1883,
    credentialsFile: path.join(__dirname, '../credentials.json')
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

const topics = ['alice', 'bob', 'carol', 'david']

// holds the client data and settings
let clients = {
    alice: null,
    bob: null,
    carol: null,
    david: null
}

// fired when a message is published
server.on('published', function(packet, client) {
    topics.forEach(function(item) {
        const validUser = (client && clients[item])
            ? client.id === clients[item].id
            : false
        if (!validUser) {
            return;
        }

        if (packet.topic === `pad/${item}`) {
            const commands = JSON.parse(packet.payload.toString())
            pad(commands, clients[item])
        } else if (packet.topic === `settings/${item}`) {
            const settings = JSON.parse(packet.payload.toString())
            if (clients[item]) {
                clients[item].config(settings)
                pino.info('Client', clients[item].player, 'keys', clients[item].keys)
            }
        }
    })
})

server.on('subscribed', function(topic, client) {
    pino.info(client.id, '-', client.user, 'subscribed to', topic)
})

// fired when a client connects
server.on('clientConnected', function(client) {
    if (clients[client.user] === null) {
        pino.info('Client Connected:', client.id, '-', client.user)
        clients[client.user] = new Client(client.id, client.user)
    } else {
        pino.warn('Client already connected', clients[client.user].player)
    }
})

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
    // only the same user can disconnect
    if (clients[client.user] && clients[client.user].id === client.id) {
        pino.info('Client Disconnected:', client.id, '-', client.user)
        clients[client.user] = null
    }
})

var gracefulShutdown = function() {
    console.log("Received kill signal, shutting down gracefully.")
    pino.info('Shutting down Mosca')
    server.close(function() {
        console.log("Closed out remaining connections.")
        process.exit()
    })

    // if after
    setTimeout(function() {
        console.error("Could not close connections in time, forcefully shutting down")
        process.exit()
    }, 10 * 1000)
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);
