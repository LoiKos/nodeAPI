'use strict';
var tables = require('../conf/tables.json');

module.exports = {

	/**
		New Syntax using generators to match ES6 standard
	*/
	setup : function(db){
		db.tx('Setup', function * (t) {
			for(let key in Object.keys(tables) ) {
				yield t.query('create table if not exists ${name~} ( ${columns^} )', tables[ Object.keys(tables)[key]]);
			}
			return true;
		})
		.then( data => {
		     console.log('Tables created ' + data);
		})
		.catch(error => {
			console.log(error);
			process.exit(1);
		});
	}
};
