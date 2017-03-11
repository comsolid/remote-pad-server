
const fs = require('fs')
const path = require('path')

class Client {

    constructor(id, player) {
        this.id = id
        this.player = player
        this.pad = {
            type: '',
            profile: ''
        }
    }

    config (settings) {
        this.pad = {
            type: settings.pad.type,
            profile: settings.pad.profile
        }

        this.setupKeys()
    }

    setupKeys () {
        const profilePath = `../profiles/${this.pad.type}/${this.pad.profile}/${this.player}.json`
        if (fs.existsSync(__dirname + '/' + profilePath)) {
            this.keys = require(profilePath)
        } else {
            this.keys = require(`${__dirname}/../profiles/fallback/nobody.json`)
            throw `Configuration for user ${this.player} with profile \
    ${this.pad.type}/${this.pad.profile} not found. Path \
    '${path.join(__dirname, profilePath)}' does not exists. \
    Starting in fallback mode, it could not work properly.`
        }
    }
}

module.exports = Client
