var tables = require('../conf/tables.json')

module.exports = {

	setup : function(db){
		db.tx( t => {
				var tmp = []
			    for( key in Object.keys(tables) ) {
			    	tmp.push(t.query('create table if not exists ${name~} ( ${columns^} )', tables[ Object.keys(tables)[key] ]) );
			    }
			    return t.batch(tmp)
			})

		.then(data => {
		    console.log("Tables created")
		})

		.catch(error => {
			console.log(error);
			process.exit(1);
		});
	}

}
