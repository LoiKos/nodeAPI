const express = require('express')
const Store = require('../model/Store.js')
const ApiError = require('../helper-error')
const router = express.Router()

let store = new Store()

router.post('/', (req,res,next) => {
	store.create(req.body).then(data => {
   		return res.status(201).json(data).end()
   	}).catch( error => {
     	return next(error)
    });
})

router.get('/:id', (req,res,next) => {
	store.find(req.params.id).then(data => {
		if (data == undefined){
			return next(ApiError.notFound())
		}
   		res.status(200).json(data).end()
   	}).catch( error => {
     	return next(error)
    });
})

router.get('/', (req,res,next) => {
	store.all(req.query.limit,req.query.offset).then(data => {
		let response = {}
		response.total = data[0].count
		if ( data[2] > 0 ) {
			response.limit = data[2]
		}
		if (data[3] > 0) {
			response.offset = data[3]
		}
		response.data = data[1]
   		return res.status(200).json(response).end()
   	}).catch( error => {
     	return next(error)
    });
})

router.delete('/:id', (req,res,next) => {
	store.delete(req.params.id).then(data => {
		if (data == undefined){
			return next(ApiError.notFound())
		}
		return res.status(200).json(data).end()
	}).catch( error => {
		return next(error)
	})
})

router.patch('/:id', (req,res,next) => {
	store.update(req.params.id,req.body).then(data => {
		return res.status(200).json(data).end()
	}).catch( error => {
		return next(error)
	})	
});

module.exports = router