const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const db = require('./app/database')
const dbCon = require('./app/postgresConnector')
const store = require('./app/routes/storeRouter')
const ApiError = require('./app/helper-error')

dbCon.setup(db)

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/api/v1/stores", store)

app.use(function (err, req, res, next) {
	console.error(err.stack)
  	res.status(ApiError.status(err.name)).send(err.message)
})

app.listen(8080, function(){
	console.log('Example app listening on port 8080!')
})