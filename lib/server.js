const socket_io = require('socket.io');
const Coraline = require('./coraline');

/*
* Server class, this class handles all coralines
*/
class Server {
	
	/*
	* constructor ({
	*	password: String <optional>	
	* })
	*/
	constructor (config) {
		this.password = config.password;
		this.coralines = {};
	}

	/*
	* createCoraline(ClientConfig config)
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

	removeCoraline (id) {
		delete this.coralines[id];
	}

	existsCoraline (id) {
		return this.coralines[id] !== undefined;
	}

	getCoraline (id) {
		return this.coralines[id];
	}

	getCoralineFor (master) {
		for(let i in this.coralines) if(this.coralines[i].master === master) return this.coralines[i];
	}

	getFreeID () {
		let id;

		do {
			id = Math.floor(Math.random() * 9000) + 1000;
		} while(this.coralines[id]);

		return id;
	}
}

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
				if(server.password !== password) return sock.emit('create-failed', 'INVALID_PASSWORD');
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