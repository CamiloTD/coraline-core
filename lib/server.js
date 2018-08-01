const socket_io = require('socket.io');
const Coraline = require('./coraline');

/**
* Server class, this class handles all coralines
*/
class Server {
	
	/**
	* @constructor
	* @param {Object} config - Configuration Object
	*/
	constructor (config) {
		/** Pair (id|coraline) object that will contains the coralines */
		this.password = config.password;
		this.coralines = {};
	}

	/**
	*	Creates a Coraline with a random ID
	*	@param {Socket} master - Coraline administrator socket, that will act as master
	*	@param {Object} config - Coraline Configuration Object
	*	@returns Coraline
	*/
	createCoraline (master, config) {
		let id = this.getFreeID();
		let coraline = new Coraline(master, { 
			name: config.name,
			password: config.password,
			max_clients: config.max_clients,
			id: id
		});

		this.coralines[id] = coraline;

		return coraline;
	}

	/**
	*	Removes an existing coraline
	*	@param {number} id - The id of the coraline you'd like to remove
	*	@returns this
	*/
	removeCoraline (id) {
		delete this.coralines[id];
		return this;
	}

	/**
	*	Checks if there is any coraline registered with that ID
	*	@param {number} id - The id of the coraline you'd like to check
	*	@returns Boolean
	*/
	existsCoraline (id) {
		return this.coralines[id] !== undefined;
	}

	/**
	*	Obtains a coraline by its id
	*	@param {number} id - The id of the coraline you'd like to check
	*	@returns Coraline
	*/
	getCoraline (id) {
		return this.coralines[id];
	}

	/**
	*	Obtains a coraline by its master
	*	@param {Socket} id - The socket of the coraline you'd like to check
	*	@returns Coraline
	*/
	getCoralineFor (master) {
		for(let i in this.coralines) if(this.coralines[i].master === master) return this.coralines[i];
	}

	/**
	*	Obtains a free ID for new coralines
	*	@returns number
	*/
	getFreeID () {
		let id;

		do {
			id = Math.floor(Math.random() * 9000) + 1000;
		} while(this.coralines[id]);

		return id;
	}
}

/** Exported function 
*	@param {SocketIOServer} io - The Socket.io server to use
*	@param {Object} config - Configuration object
*	@returns Server
*/
module.exports = function create (io, config = {}) {
	let server = new Server(config);
	
	io.on('connection', (sock) => {
		let client, coraline;
		// Authentication
			sock.on('login', async (cora, pass) => {
				coraline = server.getCoraline(cora);

				if(!coraline) return sock.emit('login-failed', 'INVALID_CORALINE');
				if(coraline.password !== pass) return sock.emit('login-failed', 'INVALID_PASSWORD');
				if(coraline.isFull()) return sock.emit('login-failed', 'CORALINE_FULL');

				client = coraline.addClient(sock);

				sock.emit('login-success', client.id, coraline.toObject());
			});

			sock.on('create', (password, config = {}) => {
<<<<<<< HEAD
				if(server.password !== password) return sock.emit('create-failed', 'INVALID_PASSWORD');
=======
>>>>>>> parent of 5cf1b2e... Removed Password Requirements
				if(typeof config !== 'object') return sock.emit('create-failed', 'INVALID_CONFIG');
				if(coraline !== undefined) return sock.emit('create-failed', 'CORALINE_FOUND');

				coraline = server.createCoraline(sock, config);
				isMaster = true;

				sock.emit('create-success', coraline.toObject());
			});

			sock.on('destroy', () => {
				if(coraline === undefined) return sock.emit('destroy-failed', 'CORALINE_NOT_FOUND');

				server.removeCoraline(coraline.id);
				coraline = undefined;

				sock.emit('destroy-success');
			});
		// Messages
			// Master
				sock.on('message-to', (tar, cmd, ...data) => {
					if(!coraline || coraline.master !== sock) return sock.emit('message-to-failed', 'NOT_A_MASTER');
					if(!coraline.hasClient(tar)) return sock.emit('message-to-failed', 'INVALID_TARGET');

					coraline.sendMessageTo(tar, cmd, ...data);
					sock.emit('message-to-success');
				});

				sock.on('query-to', (tar, iid, cmd, ...data) => {
					if(!coraline || coraline.master !== sock) return sock.emit('query-to-failed', 'NOT_A_MASTER');
					if(!coraline.hasClient(tar)) return sock.emit('query-to-failed', 'INVALID_TARGET');

					coraline.sendQueryTo(tar, iid, cmd, ...data);
					sock.emit('query-to-success');
				});

				sock.on('resolve-to', (id, iid, ...data) => {
					if(!coraline || coraline.master !== sock) return sock.emit('resolve-to-failed', 'NOT_A_MASTER');
					
					coraline.resolveQueryTo(id, iid, ...data);
					sock.emit('resolve-to-success');
				});

				sock.on('broadcast', (cmd, ...data) => {
					if(!coraline || coraline.master !== sock) return sock.emit('broadcast-failed', 'NOT_A_MASTER');

					coraline.broadcastMessage(cmd, ...data);
					sock.emit('broadcast-success');
				});
			// Client
				sock.on('message', (cmd, ...data) => {
					if(!client) return sock.emit('message-failed', 'NOT_A_CLIENT');
					coraline.sendMessage(client.id, cmd, ...data);
					sock.emit('message-success');
				});

				sock.on('query', (iid, cmd, ...data) => {
					if(!client) return sock.emit('query-failed', 'NOT_A_CLIENT');
					coraline.sendQuery(client.id, iid, cmd, ...data);
					sock.emit('query-success');
				});
				
				sock.on('resolve', (iid, ...data) => {
					if(!client) return sock.emit('resolve-failed', 'NOT_A_CLIENT');
					
					coraline.resolveQuery(client.id, iid, ...data);
					sock.emit('resolve-success');
				});
	});

	return server;
};