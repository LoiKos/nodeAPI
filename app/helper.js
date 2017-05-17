module.exports = {

	generateRef : function( prefix = "", suffix  = "" ) {

		let charSet = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9".split(",");
		let str = prefix

		for (let i = 0; i < 14; i++) {
			str += charSet[Math.floor((Math.random() * 100)) % charSet.length]
		}
		
		str += suffix 
		return str
	}

}