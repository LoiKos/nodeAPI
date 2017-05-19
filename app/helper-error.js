/** 
	This module make easier the way to handle error in the API
	You can define your error base on an extension of the Error Class that allow you to customize then name of the Error.
	You can also specify a special response code pass via status method 

	all status codes : https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP
*/

module.exports = {

	parsingError: ((message) => { return new CustomError('parsingError', message)}),
	
	missingProperty: ((message) => { return new CustomError('missingProperty', message)}),
	
	notFound: ((message) => { return new CustomError('notFound', message)}),

	status: ((name) => { switch(name){
		case "notFound":
			return 404;
		case "missingProperty": 
			return 400;
		default:
			return 500;
		}
	})
}

class CustomError extends Error {

	constructor(name, message) {
		super(message)
		this.name = name
		Error.captureStackTrace(this, CustomError)
	}

}

