/**
*	Saves and manages Client back-end data
*/
class Client {

	/**
	*	@constructor
	*	@param {Socket} sock - Client SocketIO connection
	*	@param {id}		id	 - Client reference ID
	*/
	constructor (sock, id) {
		/** @member {Socket} */
		this.sock = sock;
		/** @member {number} */
		this.id = id;
	}
}

module.exports = Client;