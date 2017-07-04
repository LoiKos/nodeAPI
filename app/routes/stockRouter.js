const express = require('express')
const Stock = require('../model/Stock.js')
const ApiError = require('../helper-error')
const router = express.Router({mergeParams: true})

let stock = new Stock()

router.post("/", (req,res,next) => {
	stock.create(req.params.store,req.body)
	.then( data => {
		let product = data[0],
				stock = data[1]
		stock.vat = stock.vat != null ? stock.vat/100 : null
		stock.priceht = stock.priceht != null ? stock.priceht/100 : null
		return res.status(201).json(merge(stock,product)).end()
	})
	.catch( error => {
		return next(error)
	})
})

router.get("/", (req,res,next) => {
	stock.all(req.params.store, req.query.limit,req.query.offset)
	.then( data => {
		if(data[1].length == 0){
			return next(ApiError.notFound())
		}
		let response = {}
		response.total = data[0].count
		if (data[2] > 0) {
			response.limit = data[2]
		}
		if (data[3] > 0 ) {
			response.offset = data[3]
		}
		response.data = data[1]
		for (item in response.data) {
			response.data[item].vat = response.data[item].vat != null ? response.data[item].vat/100 : null
			response.data[item].priceht = response.data[item].priceht != null ? response.data[item].priceht/100 : null
		}
		return res.status(200).json(response).end()
	})
	.catch(error => {
		return next(error)
	})
})

router.get("/:product", (req,res,next) => {
	stock.find(req.params.store, req.params.product)
	.then( data => {
		if(data == null){
			return next(ApiError.notFound("Product not found in stock"))
		}
		data.vat = data.vat != null ? data.vat / 100 : null
		data.priceht = data.priceht != null ? data.priceht / 100 : null
		return res.status(200).json(data).end()
	})
	.catch( error => {
		return next(error)
	})
})

router.delete("/:product", (req,res,next) => {
	stock.delete(req.params.store, req.params.product)
	.then( data => {
		if(data.length == 0){
			return next(ApiError.notFound())
		}
		let stock = data[0]
		stock.vat = stock.vat != null ? stock.vat / 100 : null
		stock.priceht = stock.priceht != null ? stock.priceht / 100 : null
		return res.status(200).json(merge(data[0],data[1])).end()
	})
	.catch( error => {
		return next(error)
	})
})

router.patch("/:product", (req,res,next) => {
	stock.update(req.params.store, req.params.product, req.body)
	.then( data => {
		if (data == undefined){
			return res.status(204).end()
		} else if (data.length == 0){
			return next(ApiError.notFound())
		}

		let stock = data[0]
		stock.vat = stock.vat != null ? stock.vat / 100 : null
		stock.priceht = stock.priceht != null ? stock.priceht / 100 : null
		res.status(200).json(merge(data[0],data[1])).end()
	})
	.catch( error => {
		return next(error)
	})
})

function merge(dict1,dict2){
	let response = dict1
	for (key in dict2){
		let nkey = `product_${key}`
		response[nkey] = dict2[key]
	}
	return response
}

module.exports = router
