const mosca = require('mosca')

const http = require('http')
const httpServ = http.createServer()

const settings = {
    port: 1883
}

var server = new mosca.Server(settings)

server.attachHttpServer(httpServ);
httpServ.listen(3000);

server.on('ready', () => {
    console.log(`Server is running at http://localhos:${settings.port}`)
})

// fired when a message is published
server.on('published', function(packet, client) {
    // console.log('Published', packet.topic, packet.payload.toString())
    console.log('Published', packet)
    // console.log('Client', client)
})
// fired when a client connects
server.on('clientConnected', function(client) {
    console.log('Client Connected:', client.id)
})

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
    console.log('Client Disconnected:', client.id)
})
