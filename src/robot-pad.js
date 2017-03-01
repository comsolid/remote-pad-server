var robot = require('robotjs')

module.exports = function (commands, player) {
    for (let prop in commands) {
        let key = player.keys[prop]
        if (key) {
            let toggle = (commands[prop] ? 'down' : 'up')
            robot.keyToggle(key, toggle)
        }
    }
}
