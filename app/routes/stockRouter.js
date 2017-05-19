const express = require('express')
const Stock = require('../model/Stock.js')
const ApiError = require('../helper-error')
const router = express.Router({mergeParams: true})

let stock = new Stock()

router.post("/", (req,res,next) => {
	stock.create(req.params.store,req.body)
	.then( data => {
		return res.status(201).json(unified(data)).end()
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
		return res.status(200).json(unified(data)).end()
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
		res.status(200).json(unified(data)).end()
	})
	.catch( error => {
		return next(error)
	})
})

function unified(data){
	let response = data[0]
	for (key in data[1]){
		let nkey = `product_${key}`
		response[nkey] = data[1][key]
	}
	return response
}

module.exports = router