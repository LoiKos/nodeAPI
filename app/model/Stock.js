'use strict';
let pgp = require('pg-promise')();
let helper = require('../helper')
let db = require('../database')
let ApiError = require('../helper-error')


module.exports = class Stock {

	constructor(){}

	table() {
		return 'stock'
	}

	create(storeId, json){
		let split_json = this.split(json)
		
		if (split_json.error){
			return Promise.reject(ApiError.parsingError("One key in the json body is not known or misspelled"))
		} else if ( this.unvalid(split_json) ){
			return Promise.reject(ApiError.missingProperty("Json does not contains all required attributes. Please verify your data"))
		}
		split_json.product.refproduct = helper.generateRef()
		split_json.product.creationdate = new Date()
		split_json.stock.refproduct = split_json.product.refproduct
		split_json.stock.refstore = storeId
		split_json.stock.creationdate = new Date()
		
		return db.tx(t=> {
			return t.any(
				pgp.helpers.concat([
					pgp.helpers.insert(split_json.product,null,'products') + 'returning *',
					pgp.helpers.insert(split_json.stock,null,'stock') + 'returning *'
				])
			);
		});
	}

	find(storeId, productId) {
		let query = `select stock.*,
					products.name as product_name,
					products.picture as product_picture,
					products.creationdate as product_creationdate,
					products.refproduct as product_refproduct
					from stock inner join products on stock.refproduct = products.refproduct 
					where stock.refstore = $1 and stock.refproduct = $2`
		return db.oneOrNone(query,[storeId, productId])
	}

	all(storeId,limit,offset) {
		return db.tx(t => {
			let q1 = t.one(`select count(*) from stock where stock.refstore = $1`, storeId)
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
						])
			return t.batch([q1,q2,limit,offset])
		});
	}

	delete(storeId, productId) {
		return db.tx(t => {
			return t.any(
				pgp.helpers.concat([
					{query:"delete from stock where refstore = $1 and refproduct = $2 returning *", values:[storeId, productId]},
					{query:"delete from products where refproduct = $1 returning *", values: productId}
				])
			)
		})
	}

	split(json){	
		let dict = {
			stock : {},
			product: {},
			error: false
		};

		for (key in json){
			switch(key){
				case "name":
					dict.product.name = json[key]
					break;
				case "picture":
					dict.product[key] = json[key]
					break;
				case "quantity":
					dict.stock[key]   = json[key]
					break;
				case "status":
					dict.stock[key]   = json[key]
					break;
				case "priceht":
					dict.stock[key]   = json[key]
					break;
				case "vat":
					dict.stock[key]   = json[key]
					break;
				default:
					dict.error = true
					return dict 
			}
		}
		return dict;
	}

	unvalid(dict){
		if(!Object.keys(dict.product).includes("name")){
			return true
		} else if (!Object.keys(dict.stock).includes('quantity') || !Object.keys(dict.stock).includes('vat') || !Object.keys(dict.stock).includes('priceht')){
			return true
		}
		return false
	}
}