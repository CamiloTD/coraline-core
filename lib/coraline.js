/**
*	All Coraline back-side data is managed here
*	@module coraline
*	@requires ./client
*/
let Client = require('./client');

/**
*	Main Coraline class, represents a Coraline
*/
class Coraline {

	/**
	*	@constructor
	*	@param {Socket} master - Administrator Socket
	*	@param {Object} config - Configuration Object
	*	@param {number} config.max_clients - Max number of clients allowed
	*	@param {String} config.name - The name of the Coraline
	*	@param {String} config.password - Security password
	*	@param {number} config.id - Internal Coraline reference ID
	*/
	constructor (master, config) {
		/** Max number clients allowed */
		this.max_clients = config.max_clients || 0;
		/** Visible name */
		this.name = config.name || "";
		/** External reference ID */
		this.id = config.id;
		/** Password required to login */
		this.password = config.password || "";
		/** Administrator Socket */
		this.master = master;
		/** Client manager */
		this.clients = {};
		/** Internal ID Counter for client IDs */
		this.iid = 0;
	}

	/**
	*	Checks if the coraline is not able to receive more connections
	*	@returns Boolean
	*/
	isFull () {
		return Object.keys(this.clients).length >= this.max_clients;
	}

	/**
	*	Creates and add a client to the client pool
	*
	*	@param {Socket} sock - The client sock
	*	@returns Client
	*/
	addClient (sock) {
		let id = this.iid++;
		let client = new Client(sock, id);

		this.clients[id] = client;

		this.broadcast('client-on', id);

		return client;
	}

	/**
	*	Get client by id
	*
	*	@param {Number} id - The client id
	*	@returns Client
	*/
	getClient (id) {
		return this.clients[id];
	}

	/**
	*	Checks if there is any client with the specified id
	*
	*	@param {Number} id - The client id
	*	@returns Boolean
	*/
	hasClient (id) {
		return this.getClient(id) !== undefined;
	}

	/**
	*	Removes a client from the pool
	*
	*	@param {Number} id - The client id
	*	@returns this
	*/
	removeClient (id) {
		delete this.clients[id];
		this.broadcast('client-off', id);

		return this;
	}

	/**
	*	Broadcasts a <b>signal</b> to all clients
	*
	*	@param {String} signal  - Signal to emit
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	broadcast (signal, ...args) {
		this.master.emit(signal, ...args);

		let c = this.clients;
		for(let i in c) c[i].sock.emit(signal, ...args);

		return this;
	}

	/**
	*	Broadcasts a <b>message</b> to all clients
	*
	*	@param {String} signal  - Signal to emit
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	broadcastMessage (signal, ...args) {
		let c = this.clients;
		for(let i in c) c[i].sock.emit('message', signal, ...args);
		return this;
	}

	/**
	*	Sends a client message to the master
	*
	*	@param {number} id  	- Client ID
	*	@param {String} signal  - Signal to emit
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	sendMessage (id, signal, ...args) {
		this.master.emit('message', id, signal, ...args);
		return this;
	}

	/**
	*	Sends a client query to the master
	*
	*	@param {number} id  	- Client ID
	*	@param {number} iid  	- Query ID
	*	@param {String} signal  - Signal to emit
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	sendQuery (id, iid, signal, ...args) {
		this.master.emit('query', id, iid, signal, ...args);
		return this;
	}

	/**
	*	Resolves a client query made by a master
	*
	*	@param {number} src  	- Client ID
	*	@param {number} iid  	- Query ID
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	resolveQuery (src, iid, ...args) {
		this.master.emit('resolve', src, iid, ...args);
		return this;
	}

	/**
	*	Sends a master message to a client
	*
	*	@param {number} id  	- Client ID
	*	@param {String} signal  - Signal to emit
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	sendMessageTo (id, signal, ...args) {
		this.getClient(id).sock.emit('message', signal, ...args);
		return this;
	}

	/**
	*	Sends a master query to a client
	*
	*	@param {number} id  	- Client ID
	*	@param {number} iid  	- Query ID
	*	@param {String} signal  - Signal to emit
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	sendQueryTo (id, iid, signal, ...args) {
		this.getClient(id).sock.emit('query', iid, signal, ...args);
		return this;
	}

	/**
	*	Resolves a master query made by a client
	*
	*	@param {number} id  	- Client ID
	*	@param {number} iid  	- Query ID
	*	@param {...Any} ...args - Arguments to send
	*	@returns this
	*/
	resolveQueryTo (id, iid, ...args) {
		this.getClient(id).sock.emit('resolve', iid, ...args);
		return this;
	}

	/**
	*	Returns an object with public info about the coraline
	*	@returns Object
	*/
	toObject () {
		return {
			id: this.id,
			max_clients: this.max_clients,
			name: this.name
		}
	}
}

/** Main Coraline class, represents a Coraline */
module.exports = Coraline;