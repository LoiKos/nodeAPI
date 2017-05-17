var pgp = require('pg-promise')({
	
});

var database_info = {
    host: 'localhost',
    port: 32768,
    database: 'MbaoDB',
    user: 'Supervisor',
    password: '1DFSQ894843NKF9F8SND9D'
};


var db = pgp(database_info);

module.exports = db;