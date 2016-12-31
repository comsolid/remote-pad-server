
const fs = require('fs')

function Client (id, player) {
    this.id = id
    this.player = player
}

Client.prototype.config = function (settings) {
    this.pad = {
        type: settings.pad.type,
        profile: settings.pad.profile
    }

    const path = `../profiles/${this.pad.type}/${this.pad.profile}/${this.player}.json`
    if (fs.existsSync(__dirname + '/' + path)) {
        this.keys = require(path)
    } else {
        throw `Path '${path}' do not exists`
    }
};

module.exports = Client
