'use strict';
const pgp = require('pg-promise')();
const helper = require('../helper');
const db = require('../database');
const ApiError = require('../helper-error');


module.exports = class Stock {

	constructor(){}

	table() {
		return 'stock';
	}

	create(storeId, json){
		let splitJson = this.split(json);

		if (splitJson.error){
			return Promise.reject(ApiError.parsingError('One key in the json body is not known or misspelled'));
		} else if ( this.unvalid(splitJson) ){
			return Promise.reject(ApiError.missingProperty('Json does not contains all required attributes. Please verify your data'));
		}
		splitJson.product.refproduct = helper.generateRef();
		splitJson.product.creationdate = new Date();
		splitJson.stock.refproduct = splitJson.product.refproduct;
		splitJson.stock.refstore = storeId;
		splitJson.stock.creationdate = new Date();

		return db.tx(t=> {
			return t.any(
				pgp.helpers.concat([
					pgp.helpers.insert(splitJson.product,null,'products') + 'returning *',
					pgp.helpers.insert(splitJson.stock,null,'stock') + 'returning *'
				])
			);
		});
	}

	find(storeId, productId) {
		const query = `select stock.*,
					products.name as product_name,
					products.picture as product_picture,
					products.creationdate as product_creationdate,
					products.refproduct as product_refproduct
					from stock inner join products on stock.refproduct = products.refproduct
					where stock.refstore = $1 and stock.refproduct = $2`;
		return db.oneOrNone(query,[storeId, productId]);
	}

	all(storeId,limit,offset) {
		return db.tx(t => {
			let q1 = t.one(`select count(*) from stock where stock.refstore = $1`, storeId);
			let q2 = t.manyOrNone(`select stock.*,
					products.name as product_name,
					products.picture as product_picture,
					products.creationdate as product_creationdate,
					products.refproduct as product_refproduct
					from stock inner join products on stock.refproduct = products.refproduct
					where stock.refstore = $1 limit $2^ offset $3`, [
						storeId,
						limit > 0 ? limit : `all`,
						offset
						]);
			return t.batch([q1,q2,limit,offset]);
		});
	}

	delete(storeId, productId) {
		return db.tx(t => {
			return t.any(
				pgp.helpers.concat([
					{query:'delete from stock where refstore = $1 and refproduct = $2 returning *', values:[storeId, productId]},
					{query:'delete from products where refproduct = $1 returning *', values: productId}
				])
			);
		});
	}

	update(storeId, productId, body){
		if (Object.keys(body).length === 0){
			return Promise.resolve();
		}
		let splitJson = this.split(body);
		if (splitJson.error){
			return Promise.reject(ApiError.parsingError('One key in the json body is not known or misspelled'));
		}
		splitJson.stock.lastupdate = new Date();
		let queries = [];
		if (Object.keys(splitJson.stock).length !== 0){
			queries.push(pgp.helpers.update(splitJson.stock,null,'stock') + ` WHERE refproduct = '${productId}' and refstore = '${storeId}' returning *`);
		}
		if (Object.keys(splitJson.product).length !== 0){
			queries.push(pgp.helpers.update(splitJson.product,null,'products') + ` WHERE refproduct = '${productId}' returning *`);
		}


		return db.tx( t => {
			return t.any(
				pgp.helpers.concat(queries)
			);
		});
	}

	split(json){
		let dict = {
			stock : {},
			product: {},
			error: false
		};

		for (let key in json){
			switch(key){
				case 'product_name':
					dict.product.name = json[key];
					break;
				case 'product_picture':
					dict.product.picture = json[key];
					break;
				case 'quantity':
					dict.stock[key]   = json[key];
					break;
				case 'status':
					dict.stock[key]   = json[key];
					break;
				case 'priceht':
					dict.stock[key]   = json[key] * 100;
					break;
				case 'vat':
					dict.stock[key]   = json[key] * 100;
					break;
				default:
					dict.error = true;
					return dict;
			}
		}
		return dict;
	}

	unvalid(dict){
		if(!Object.keys(dict.product).includes('name')){
			return true;
		} else if (!Object.keys(dict.stock).includes('quantity') || !Object.keys(dict.stock).includes('vat') || !Object.keys(dict.stock).includes('priceht')){
			return true;
		}
		return false;
	}
};
