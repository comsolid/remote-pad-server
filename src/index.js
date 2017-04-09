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
    david: null,
    gui: null
}

let profile = process.env.PROFILE || 'n64--default'

// fired when a message is published
server.on('published', function(packet, client) {
    if (packet.topic === 'gui/profile') {
        profile = packet.payload.toString()
        // update each player
        for (var i = 0; i < topics.length; i++) {
            console.log('configuring', topics[i])
            const c = clients[topics[i]]
            if (c) {
                c.pad.profile = profile
                c.setupKeys()
                pino.info(`Client '${c.player}' \
using profile '${c.pad.profile}' with keys`, c.keys)
                notifyProfile(profile, c.player)
            }
        }
    } else {
        const [ type, player ] = packet.topic.split('/')
        const validUser = (client && clients[player])
            ? client.id === clients[player].id
            : false
        if (validUser) {
            if (type.lastIndexOf('pad', 0) == 0) {
                const commands = JSON.parse(packet.payload.toString())
                pad(commands, clients[player])
            } else if (type.lastIndexOf('settings', 0) == 0) {
                const settings = JSON.parse(packet.payload.toString())
                // override user settings
                // TODO: remove profile selection from remote-pad web
                settings.pad.profile = profile
                if (clients[player]) {
                    try {
                        clients[player].config(settings)
                        notifyProfile(profile, player)
                    } catch (err) {
                        pino.error(err)
                        notifyPlayer(clients[player].player, err, 'error')
                    }
                    pino.info(`Client '${clients[player].player}' \
                    using profile '${clients[player].pad.profile}' with keys`, clients[player].keys)
                }
            }
        }
    }
})

server.on('subscribed', function(topic, client) {
    pino.info(client.id, '-', client.user, 'subscribed to', topic)
    notifyProfile(profile, client.user)
})

// fired when a client connects
server.on('clientConnected', function(client) {
    if (clients[client.user] === null) {
        pino.info('Client Connected:', client.id, '-', client.user)
        clients[client.user] = new Client(client.id, client.user)

        notifyGui(client.user, true)
    } else {
        pino.warn('Client already connected', clients[client.user].player)
    }
    notifyProfile(profile, client.user)
})

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
    // only the same user can disconnect
    if (clients[client.user] && clients[client.user].id === client.id) {
        pino.info('Client Disconnected:', client.id, '-', client.user)
        clients[client.user] = null

        notifyGui(client.user, false)
    }
})

function notifyGui(player, isConnected) {
    server.publish({
        topic: 'gui/player',
        payload: JSON.stringify({
            name: player,
            connected: isConnected,
            qos: 1,
            retain: false
        })
    }, () => {
        pino.info('gui notified')
    })
}

function notifyPlayer(player, message, messageType) {
    server.publish({
        topic: `message/${player}`,
        payload: JSON.stringify({
            message: message,
            messageType: messageType,
            timestamp: new Date(),
            qos: 1,
            retain: false
        })
    }, () => {
        pino.info(`Player ${player} notified`)
    })
}

function notifyProfile(profile, player) {
    server.publish({
        topic: `profile/${player}`,
        payload: JSON.stringify({
            profile: profile,
            qos: 1,
            retain: false
        })
    }, () => {
        pino.info(`Profile change notified to ${player}, new value: ${profile}`)
    })
}

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
