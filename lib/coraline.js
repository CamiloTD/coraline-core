let Client = require('./client');

class Coraline {

	constructor (master, config) {
		this.max_clients = config.max_clients;
		this.name = config.name;
		this.id = config.id;
		this.password = config.password;
		this.master = master;
		this.clients = {};
		this.iid = 0;
	}

	isFull () {
		return Object.keys(this.clients).length >= this.max_clients;
	}

	addClient (sock) {
		let id = this.iid++;
		let client = new Client(sock, id);

		this.clients[id] = client;

		this.broadcast('client-on', id);

		return client;
	}

	getClient (id) {
		return this.clients[id];
	}

	hasClient (id) {
		return this.getClient(id) !== undefined;
	}

	removeClient (id) {
		delete this.clients[id];
		this.broadcast('client-off', id);
	}

	broadcast (cmd, ...rest) {
		this.master.emit(cmd, ...rest);

		let c = this.clients;
		for(let i in c) c[i].sock.emit(cmd, ...rest);
	}

	broadcastMessage (cmd, ...rest) {
		this.broadcast('message', cmd, ...rest);
	}

	sendMessage (id, cmd, ...data) {
		this.master.emit('message', id, cmd, ...data);
	}

	sendQuery (id, iid, cmd, ...data) {
		this.master.emit('query', id, iid, cmd, ...data);
	}

	resolveQuery (src, iid, ...data) {
		this.master.emit('resolve', src, iid, ...data);
	}

	sendMessageTo (id, cmd, ...data) {
		this.getClient(id).sock.emit('message', cmd, ...data);
	}

	sendQueryTo (id, iid, cmd, ...data) {
		this.getClient(id).sock.emit('query', iid, cmd, ...data);
	}

	resolveQueryTo (id, iid, ...data) {
		this.getClient(id).sock.emit('resolve', iid, ...data);
	}

	toObject () {
		return {
			id: this.id,
			max_clients: this.max_clients,
			name: this.name
		}
	}
}

module.exports = Coraline;