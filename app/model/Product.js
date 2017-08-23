'use strict';

const helper = require('../helper');
const db = require('../database');
const ApiError = require('../helper-error');

module.exports = class Product {

	constructor() {

	}

	table() {
		return 'products';
	}

	create(json) {

		let obj = {
			refproduct: helper.generateRef(),
			name: null,
			picture: null,
			creationdate: Date()
		};

		let keys = ['name', 'picture'];
		for (let key in json) {
			if (keys.includes(key))  {
				obj[key] = json[key];
			} else {
				return Promise.reject(ApiError.notFound('One key in the json body is not known'));
			}
		}
		return db.one('insert into ' + this.table() + '(${this~}) VALUES( ${refproduct}, ${name}, ${picture}, ${creationdate}) returning *', obj);
	}

	find(id) {
		return db.oneOrNone('select * from ' + this.table() + ' where refproduct = $1', [id]);
	}

	all(limit = 0, offset = 0) {
		return db.tx(t => {
			let q1 = t.one('select count(*) from ' + this.table() + '', {});
			let q2 = t.manyOrNone('select * from ' + this.table() + ' limit $1^ offset $2', [
					limit > 0 ? limit : 'all',
					offset
				]);
				// returning a promise that determines a successful transaction:
			return t.batch([q1, q2, limit, offset]); // all of the queries are to be resolved;
		});
	}

	delete(id) {
		return db.oneOrNone('delete from ' + this.table() + ' where refproduct = $1 returning *', [id]);
	}

	update(id, json) {
		return db.task(function*(t) {

			let product = yield t.oneOrNone('select * from products where refproduct = $1', [id]);

			if (!product) {
				throw ApiError.notFound();
			}
			for (let key in json) {
				if (Object.keys(product).includes(key) && ['refproduct', 'creationdate'].indexOf(key) === -1) {
					product[key] = json[key];
				} else {
					throw ApiError.notFound('One key in the json body is not known or can\'t be modified');
				}
			}
			return yield t.one('update products set name = ${name}, picture = ${picture}  where refproduct = ${refproduct} returning *', product);
		});
	}
};