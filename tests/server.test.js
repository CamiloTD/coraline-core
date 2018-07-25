const Server = require('../lib/server');
const io = require('socket.io')();
const Client = require('socket.io-client');

const URL = 'http://localhost:8000';

const PASSWORD = 'C0ral1n3';
const CONFIG = { password: "C0ral1n3" };

io.listen(8000);

let server = Server.create(io, CONFIG);

// Authentication
	// Create
		test('/create: INVALID_PASSWORD', (done) => {
			let client = Client(URL);
			client.emit('create', 'bad_password');

			client.once('create-failed', (reason) => {
				if(reason === "INVALID_PASSWORD") {
					client.destroy();
					return done();
				}

				client.destroy();
				throw "Incorrect Reason: " + reason;
			});

			client.once('create-success', (id) => {
				client.destroy();
				throw "Logged In...";
			});
		});

		test('/create: INVALID_CONFIG', (done) => {
			let client = Client(URL);
			client.emit('create', PASSWORD, 'String');

			client.once('create-failed', (reason) => {
				if(reason === "INVALID_CONFIG") {
					client.destroy();
					return done();
				}

				client.destroy();
				throw "Incorrect Reason: " + reason;
			});

			client.once('create-success', (id) => {
				client.destroy();
				throw "Logged In...";
			});
		});

		test('/create: OK', (done) => {
			let client = Client(URL);
			client.emit('create', PASSWORD, CONFIG);

			client.once('create-failed', (reason) => {
				client.destroy();
				throw reason;
			});

			client.once('create-success', (id) => {
				client.destroy();
				done();
			});
		});
	// Login
		test('/login: INVALID_CORALINE', (done) => {
			let foo = Client(URL);

			foo.emit('login', 7777, 'bad_password');
			foo.on('login-failed', (reason) => {
				foo.destroy();

				if(reason !== 'INVALID_CORALINE')
					throw "Invalid Reason: " + reason;
				else
					done();
			});
		});

		test('/login: INVALID_PASSWORD', (done) => {
			let foo = Client(URL);
			let bar = Client(URL);
			bar.emit('create', PASSWORD, CONFIG);

			bar.once('create-failed', (reason) => {
				foo.destroy();
				bar.destroy();
				throw "Cannot create Coraline: " + reason;
			});

			bar.once('create-success', (coraline) => {
				foo.emit('login', coraline.id, 'bad_password');

				foo.on('login-failed', (reason) => {
					foo.destroy();
					bar.destroy();

					if(reason !== 'INVALID_PASSWORD')
						throw "Invalid Reason: " + reason;
					else
						done();
				});
			});
		});

		test('/login: CORALINE_FULL', (done) => {
			let foo = Client(URL);
			let bar = Client(URL);

			bar.emit('create', PASSWORD, { password: CONFIG.password, max_clients: 0 });

			bar.once('create-failed', (reason) => {
				foo.destroy();
				bar.destroy();
				throw "Cannot create Coraline: " + reason;
			});

			bar.once('create-success', (coraline) => {
				foo.emit('login', coraline.id, CONFIG.password);

				foo.on('login-failed', (reason) => {
					foo.destroy();
					bar.destroy();

					if(reason !== 'CORALINE_FULL')
						throw "Invalid Reason: " + reason;
					else
						done();
				});
			});
		});

		test('/login: OK', (done) => {
			let foo = Client(URL);
			let bar = Client(URL);
			
			bar.emit('create', PASSWORD, CONFIG);

			bar.once('create-failed', (reason) => {
				foo.destroy();
				bar.destroy();
				throw "Cannot create Coraline: " + reason;
			});

			bar.once('create-success', (coraline) => {
				foo.emit('login', coraline.id, CONFIG.password);

				foo.on('login-failed', (reason) => {
					foo.destroy();
					bar.destroy();
					
					throw reason;
				});

				foo.on('login-success', (client_id, coraline) => {
					foo.destroy();
					bar.destroy();
					
					done();
				});
			});
		});
	// Destroy
		test('/destroy: CORALINE_NOT_FOUND', (done) => {
			let client = Client(URL);
			client.emit('destroy', 7777);

			client.once('destroy-failed', (reason) => {
				client.destroy();

				if(reason !== 'CORALINE_NOT_FOUND') throw 'Invalid Reason: ' + reason;

				done();
			})

			client.once('destroy-success', () => {
				client.destroy();
				throw "Coraline was destroyed...";
			});
		});


		test('/destroy: OK', (done) => {
			let client = Client(URL);
			client.emit('create', PASSWORD, CONFIG);

			client.once('create-failed', (reason) => {
				client.destroy();
				throw reason;
			});

			client.once('create-success', (coraline) => {
				let passed = false;
				client.emit('destroy');

				client.once('destroy-failed', (reason) => {
					if(passed) return;
					client.destroy();

					throw reason;
				});

				client.once('destroy-success', () => {
					passed = true;
					client.emit('destroy');

					client.once('destroy-failed', (reason) => {
						client.destroy();

						if(reason !== 'CORALINE_NOT_FOUND') throw 'Invalid Reason: ' + reason;

						done();
					})

					client.once('destroy-success', () => {
						throw "Coraline was destroyed...";
					});
				});
			});
		});
// Messages
	// Messages
		// Server to Client: /message-to
			test('/message-to: NOT_A_MASTER', (done) => {
				let foo = Client(URL);

				foo.emit('message-to', 0, 'some_command', 'some_data');

				foo.once('message-to-failed', (reason) => {
					foo.destroy();

					if(reason !== 'NOT_A_MASTER') throw 'Invalid reason: ' + reason;

					done();
				});
			});

			test('/message-to: INVALID_TARGET', async (done) => {
				let foo = Client(URL);
				let coraline = await CreateCoraline(foo, CONFIG);

				foo.emit('message-to', 0, 'some_command', 'some_data');

				foo.once('message-to-failed', (reason) => {
					foo.destroy();

					if(reason !== 'INVALID_TARGET') throw 'Invalid reason: ' + reason;

					done();
				});
			});

			test('/message-to: OK', async (done) => {
				let foo = Client(URL);
				let bar = Client(URL);

				let coraline = await CreateCoraline(foo, CONFIG);
				let [ client_id ] = await LoginClient(bar, coraline.id, PASSWORD);

				foo.emit('message-to', client_id, 'some_command', 'some_data');
				foo.once('message-to-failed', (reason) => {
					Clean(foo, bar);
					throw reason;
				});

				bar.once('message', (command, data) => {
					Clean(foo, bar);

					if(command !== 'some_command') throw "Invalid command received: " + command;
					if(data !== 'some_data') throw "Invalid data received: " + command;

					done();
				});
			});
		// Client to Server: /message
			test('/message: NOT_A_CLIENT', (done) => {
				let foo = Client(URL);

				foo.emit('message', 0, 'some_command', 'some_data');

				foo.once('message-failed', (reason) => {
					foo.destroy();

					if(reason !== 'NOT_A_CLIENT') throw 'Invalid reason: ' + reason;

					done();
				});
			});

			test('/message: OK', async (done) => {
				let foo = Client(URL);
				let bar = Client(URL);

				let coraline = await CreateCoraline(foo, CONFIG);
				let [ client_id ] = await LoginClient(bar, coraline.id, PASSWORD);

				bar.emit('message', 'some_command', 'some_data');
				bar.once('message-failed', (reason) => {
					Clean(foo, bar);
					throw reason;
				});

				foo.once('message', (src, command, data) => {
					Clean(foo, bar);

					if(src !== client_id) throw "Incorrect ID: " + src + ", client_id: " + client_id;
					if(command !== 'some_command') throw "Invalid command received: " + command;
					if(data !== 'some_data') throw "Invalid data received: " + command;

					done();
				});
			});
	// Queries
		// Server to client: /query-to
			test('/query-to: OK', async (done) => {
				let server = Client(URL);
				let client = Client(URL);

				let coraline = await CreateCoraline(server, CONFIG);
				let [ client_id ] = await LoginClient(client, coraline.id, PASSWORD);


				const IID = 5767;

				server.emit('query-to', client_id, IID, 'multiply', 2, 3);
				server.once('query-to-failed', (err) => {
					Clean(server, client);

					throw err;
				});

				client.once('resolve-failed', (err) => {
					Clean(server, client);

					throw err;
				});
				
				client.once('query', (iid, cmd, n1, n2) => {
					if(iid !== IID) {
						Clean(server, client);
						throw "Invalid IID: " + iid + ", IID: " + IID;
					}
					
					if(cmd !== 'multiply') {
						Clean(server, client);
						throw "Invalid Command: " + cmd + ", expected: multiply";
					}

					let response = n1 * n2;

					if(response !== 6) {
						Clean(server, client);
						throw `Corrupted Data: (${n1} * ${n2}) !== 6`;	
					}

					client.emit('resolve', iid, response);
				});

				server.once('resolve', (cli_id, iid, res) => {
					if(cli_id !== client_id) {
						Clean(server, client);
						throw "Invalid response client_id: " + cli_id + ", client_id: " + client_id;
					}

					if(iid !== IID) {
						Clean(server, client);
						throw "Invalid IID: " + iid + ", IID: " + IID;
					}


					if(res !== 6) {
						Clean(server, client);
						throw `Corrupted response data: ${res} !== 6`;	
					}

					done();
				});
			});
		// Client to Server: /query
			test('/query: OK', async (done) => {
				let server = Client(URL);
				let client = Client(URL);

				let coraline = await CreateCoraline(server, CONFIG);
				let [ client_id ] = await LoginClient(client, coraline.id, PASSWORD);


				const IID = 5767;

				client.emit('query', IID, 'multiply', 2, 3);
				client.once('query-failed', (err) => {
					Clean(server, client);

					throw err;
				});

				server.once('resolve-to-failed', (err) => {
					Clean(server, client);

					throw err;
				});
				
				server.once('query', (id, iid, cmd, n1, n2) => {
					if(id !== client_id) {
						Clean(server, client);
						throw "Invalid client_id: " + id + ", client_id: " + client_id;
					}

					if(iid !== IID) {
						Clean(server, client);
						throw "Invalid IID: " + iid + ", IID: " + IID;
					}
					
					if(cmd !== 'multiply') {
						Clean(server, client);
						throw "Invalid Command: " + cmd + ", expected: multiply";
					}

					let response = n1 * n2;

					if(response !== 6) {
						Clean(server, client);
						throw `Corrupted Data: (${n1} * ${n2}) !== 6`;	
					}

					server.emit('resolve-to', id, iid, response);
				});

				client.once('resolve', (iid, res) => {
					if(iid !== IID) {
						Clean(server, client);
						throw "Invalid IID: " + iid + ", IID: " + IID;
					}


					if(res !== 6) {
						Clean(server, client);
						throw `Corrupted response data: ${res} !== 6`;	
					}

					done();
				});

			});
	// Broadcasting
		test('/broadcast: OK', async (done) => {
			let foo = Client(URL);
			let bar = Client(URL);

			let coraline = await CreateCoraline(foo, CONFIG);
			let [ client_id ] = await LoginClient(bar, coraline.id, PASSWORD);

			foo.emit('broadcast', 'some_command', 'some_data');
			foo.once('broadcast-failed', (reason) => {
				Clean(foo, bar);
				throw reason;
			});

			bar.once('message', (command, data) => {
				Clean(foo, bar);

				if(command !== 'some_command') throw "Invalid command received: " + command;
				if(data !== 'some_data') throw "Invalid data received: " + command;

				done();
			});
		});

function CreateCoraline (client, config) {
	return new Promise ((done, err) => {
		client.emit('create', PASSWORD, config);

		client.once('create-failed', err);
		client.once('create-success', done);
	});
}

function LoginClient (client, coraline_id, pass) {
	return new Promise((done, err) => {
		client.emit('login', coraline_id, pass);
		client.once('login-failed', err);
		client.once('login-success', (id, cora) => done([id, cora]));
	});
}

function Clean (...sock) {
	sock.forEach((s) => s.destroy());
}