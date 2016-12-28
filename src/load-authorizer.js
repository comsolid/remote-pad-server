var fs = require("fs");
var Authorizer = require("mosca/lib/authorizer");

module.exports = function loadAuthorizer(program, cb) {
    if (program.credentialsFile) {
        fs.readFile(program.credentialsFile, function(err, data) {
            if (err) {
                cb(err);
                return;
            }

            var authorizer = new Authorizer();

            try {
                authorizer.users = JSON.parse(data);
                cb(null, authorizer);
            } catch(err) {
                cb(err);
            }
        });
    } else {
        cb(null, null);
    }
}
