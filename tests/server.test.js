let Server = require('../server');
let Client = require('socket.io-client');
const PASSWORD = "C@raline";

// Server Works
	test("Server connections work", (done) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', async () => {
			client.disconnect();
			await server.close();
			done();
		});

		let client = Client.connect('http://localhost:1001', { reconnect: true });
	});
// Channel Creation
	test("Channel creation fails", (done) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', (sock) => {
			client.emit('create-channel', { name: "Random Channel" }, "wrong-pass");
		});

		let client = Client.connect('http://localhost:1001', { reconnect: true });


		client.on('channel-created', (chan) => {
			throw "Connected without correct credentials.";
		});
		
		client.on('cannot-create-channel', async () => {
			client.disconnect();
			await server.close();
			done();
		});
	});

	test("Channel creation success", (done, err) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', (sock) => {
			client.emit('create-channel', { name: "Random Channel" }, PASSWORD);
			client.on('channel-created', async (chan) => {
				client.disconnect();
				await server.close();
				done();
			});

			client.on('cannot-create-channel', () => {
				throw "Incorrect Password"
			});
		});

		let client = Client.connect('http://localhost:1001', { reconnect: true });

	});
// Channel Join
	test("Channel join: channel not found", (done) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', (sock) => {
			foo.emit('join-channel', "????");
		});

		let foo = Client.connect('http://localhost:1001', { reconnect: true });

		foo.on('invalid-channel', async () => {
			foo.disconnect();
			await server.close();
			done();
		});
	});

	test("Channel join: wrong password", (done) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', (sock) => {

			client.emit('create-channel', { name: "Random Channel", password: "R@ndom" }, PASSWORD);

			client.on('channel-created', (chan) => {
				foo.emit('join-channel', chan, "wrong-pass");
			});
		});

		let client = Client.connect('http://localhost:1001', { reconnect: true });
		let foo = Client.connect('http://localhost:1001', { reconnect: true });

		foo.on('incorrect-channel-password', async () => {
			foo.disconnect();
			await server.close();
			done();
		});
	});

	test("Channel join: full channel", (done) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', (sock) => {

			client.emit('create-channel', { name: "Random Channel", password: "R@ndom", max_clients: 0 }, PASSWORD);

			client.on('channel-created', (chan) => {
				foo.emit('join-channel', chan, "R@ndom");
			});
		});

		let client = Client.connect('http://localhost:1001', { reconnect: true });
		let foo = Client.connect('http://localhost:1001', { reconnect: true });

		foo.on('channel-full', async () => {
			foo.disconnect();
			await server.close();
			done();
		});

		foo.on('channel-join-success', () => { throw "Connected successfully"; });
	});

	test("Channel join: success", (done) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', (sock) => {

			client.emit('create-channel', { name: "Random Channel", password: "R@ndom" }, PASSWORD);

			client.on('channel-created', (chan) => {
				foo.emit('join-channel', chan, "R@ndom");
			});
		});

		let client = Client.connect('http://localhost:1001', { reconnect: true });
		let foo = Client.connect('http://localhost:1001', { reconnect: true });

		foo.on('channel-join-success', async () => {
			foo.disconnect();
			await server.close();
			done();
		});
	});

	test("Channel join: has client", (done) => {
		let server = new Server(1001);

		server.listen();
		server.server.on('connection', (sock) => {

			client.emit('create-channel', { name: "Random Channel", password: "R@ndom" }, PASSWORD);

			client.on('channel-created', (chan) => {
				foo.emit('join-channel', chan, "R@ndom");
			});
		});

		let client = Client.connect('http://localhost:1001', { reconnect: true });
		let foo = Client.connect('http://localhost:1001', { reconnect: true });

		foo.on('channel-join-success', (chan) => {
			foo.emit('join-channel', chan, "R@ndom");
			
			foo.on('channel-has-client', async () => {
				foo.disconnect();
				await server.close();
				done();
			});
		});
	});