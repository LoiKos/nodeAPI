'use strict';

let helper = require('../helper')
let db = require('../database')
let ApiError = require('../helper-error')

module.exports = class Product {

	constructor() {

	}

	table() {
		return 'products'
	}

	create(json){

		var obj = { 
			refproduct : helper.generateRef(),
			name : null,
			picture : null,
			creationdate : Date()
		}

		let keys = ["name","picture"]
		for (key in json){
			if (keys.includes(key)) {
				obj[key] = json[key]
			} else {
				return Promise.reject(ApiError.notFound("One key in the json body is not known"))
			}
		}
		return db.one("insert into "+this.table()+"(${this~}) VALUES( ${refproduct}, ${name}, ${picture}, ${creationdate}) returning *", obj)
	}

	find(id){
		return db.one("select * from "+this.table()+" where refproduct = $1",[id])
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

	delete(id){
		return db.one("delete from "+this.table()+" where refproduct = $1 returning *",[id])
	}

	update(id, json) {
		return db.task(t => {
			return this.find(id).then(product => {
				for(key in json){
					if (Object.keys(product).includes(key) && ["refproduct","creationdate"].indexOf(key) == -1){
						product[key] = json[key]
					} else {
						return Promise.reject(ApiError.notFound("One key in the json body is not known or can't be modified"))
					}
				}
				return t.one('update '+this.table()+' set name = ${name}, picture = ${picture}  where refproduct = ${refproduct} returning *', product)
			})
		})
	}
}