'use strict';
const monitor = require('pg-monitor');
const options = {
	
};

const pgp = require('pg-promise')(options);

const databaseInfo = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_DB,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
};

monitor.attach(options);

const db = pgp(databaseInfo);

module.exports = db;
