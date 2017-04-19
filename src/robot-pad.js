var robot = require('robotjs')

module.exports = function (commands, player) {
    if (player.keys) {
        for (let prop in commands) {
            let key = player.keys[prop]
            if (key) {
                let toggle = (commands[prop] ? 'down' : 'up')
                robot.keyToggle(key, toggle)
            }
        }
    } else {
        throw `Player ${player.player} keys not configured. Try setting up again
in the Configuration Screen.`
    }
}
