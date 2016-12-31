var robot = require('robotjs')

module.exports = function (commands, player) {
    for (let prop in commands) {
        let toggle = (commands[prop] ? 'down' : 'up')
        robot.keyToggle(player.keys[prop], toggle)
    }
}
