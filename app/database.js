var pgp = require('pg-promise')({

});

var database_info = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_DB,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
};


var db = pgp(database_info);

module.exports = db;
