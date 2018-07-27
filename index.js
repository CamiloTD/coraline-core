/** @module coraline-core */
/** 
* Exposes ./lib/server.js
* @param {SocketIOServer} io - The Socket.io server to use
* @param {Object} config - Configuration object
*/
exports.createServer = require('./lib/server');