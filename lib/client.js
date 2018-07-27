/**
*	Saves and manages Client back-end data
*	@module client
*/

/** Saves and manages client back-end data */
class Client {

	/**
	*	@constructor
	*	@param {Socket} sock - Client SocketIO connection
	*	@param {id}		id	 - Client reference ID
	*/
	constructor (sock, id) {
		this.sock = sock;
		this.id = id;
	}

}

/** Saves and manages Client back-end data */
module.exports = Client;