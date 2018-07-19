class Channel {

	constructor (config, master) {
		let { id, max_clients, password, name } = config;

		this.name = name;
		this.id = id;
		this.max_clients = max_clients === undefined?  Infinity: max_clients;
		this.password = password;
		this.master = master;
		this.clients = new Set();
	}

	isFull () {
		return this.max_clients <= this.clients.size;
	}

	joinClient (sock) {
		this.clients.add(sock);
	}

}

module.exports = Channel;