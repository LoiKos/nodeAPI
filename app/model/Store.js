'use strict';

let helper = require('../helper')
let db = require('../database')
let ApiError = require('../helper-error')

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
		return db.oneOrNone("select * from "+this.table()+" where refstore = $1", id)
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
		return db.oneOrNone("delete from ${table~} where refstore = ${id} returning *",{
			table: this.table(),
			id: id
		})
	}

	update(id, json) {
		return db.task(t => {
			return this.find(id).then(store => {
				if(!store){
					return Promise.reject(ApiError.notFound())
				}
				for(key in json){
					if (Object.keys(store).includes(key) && key != "refstore"){
						store[key] = json[key]
					} else {
						return Promise.reject(ApiError.notFound("One key in the json body is not known or can't be modified"))
					}
				}
				return t.one('update '+this.table()+' set name = ${name}, vat = ${vat}, picture = ${picture}, merchantkey = ${merchantkey}  where refstore = ${refstore} returning *', store)
			})
		})
	}
};