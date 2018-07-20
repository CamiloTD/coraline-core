class Channel {

	constructor (config, master) {
		let { id, max_clients, password, name } = config;

		this.name = name;
		this.id = id;
		this.max_clients = max_clients === undefined?  Infinity: max_clients;
		this.password = password;
		this.master = master;
		this.clients = new Set();
		this.messages = {};
	}

	isFull () {
		return this.max_clients <= this.clients.size;
	}

	joinClient (sock) {
		this.clients.add(sock);
		this.master.emit('client-joined', s.id);
	}

	sendMessage (sock, name, data, id) {
		this.master.emit('message', name, sock.id, id, data);
	}

	broadcast (msg, data) {
		this.clients.forEach((sock) => sock.emit(msg, data));
	}

	clean () {
		this.master.emit('channel-destroyed', this.id);
		this.clients.forEach((sock) => sock.emit('channel-destroyed', this.id));
	}
}

module.exports = Channel;