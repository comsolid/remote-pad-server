var robot = require('robotjs')

module.exports = function (commands) {
    for (let prop in commands) {
        let toggle = (commands[prop] ? 'down' : 'up')
        robot.keyToggle(prop, toggle)
    }
}
