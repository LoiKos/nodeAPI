'use strict';

let helper = require('../helper')
let db = require('../database')
let ApiError = require('../helper-error')
var pgp = require('pg-promise')({
	
});

module.exports = class Store {

	constructor() {

	}

	table() {
		return 'stores'
	}

	create(json) {	
		let obj = { 
			refstore : helper.generateRef(),
			name : null,
			vat : null,
			picture : null,
			merchantkey : null
		}
		let keys = Object.keys(obj)

		for (key in json){
			if (keys.indexOf(key)){
				obj[key] = json[key]
			} else {
				return Promise.reject(ApiError.notFound("One key in the json body is not known"))
			}
		}
		return db.one("insert into "+this.table()+"(${this~}) VALUES( ${refstore}, ${name}, ${vat}, ${picture}, ${merchantkey}) returning *", obj)
	}

	find(id) {
		return db.one("select * from "+this.table()+" where refstore = $1", id)
	}

	all(limit = 0, offset = 0) {
		return db.tx(t => {
		    var q1 = this.count()
		    var q2 = db.manyOrNone("select * from "+this.table()+" limit $1^ offset $2",[
			limit > 0 ? limit : "all", offset
			])
		    // returning a promise that determines a successful transaction:
		    return t.batch([q1, q2,limit, offset]); // all of the queries are to be resolved;
		})
		
	}

	count() {
		return db.one("select count(*) from "+this.table()+"",{})
	}

	delete(id) {
		return db.one("delete from ${table~} where refstore = ${id} returning *",{
			table: this.table(),
			id: id
		})
	}

	update(id, json) {
		let obj = {}
		for (key in json){
			if( ["name","vat","picture","merchantkey"].includes(key) ){
				obj[key] = json[key]
			} else {
				return Promise.reject(ApiError.notFound("One key in the json body is not known"))
			}
		}

		return db.one("update "+this.table()+" set (${obj~}) = (${name},${vat},${picture},${merchantkey}) where refstore = ${id} returning *",{
			obj:obj,
			name: obj.name,
			vat: obj.vat,
			picture: obj.picture,
			merchantkey: obj.merchantkey,
			id:id
		})
	}
};