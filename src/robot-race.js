var robot = require('robotjs')

var players = {
    alice: require('./1-alice.json'),
    bob: require('./2-bob.json')
}

module.exports = function (commands, player) {
    for (let prop in commands) {
        let toggle = (commands[prop] ? 'down' : 'up')
        robot.keyToggle(players[player][prop], toggle)
    }
}
