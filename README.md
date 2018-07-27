# coraline-core
**Coraline-core is the back-end library of the Coraline Project**

**If you are searching for the front-end client library, please look at:** [Coraline-client](https://github.com/CamiloTD/coraline-client)

With Coraline-core you can send messages between different Socket.io endpoints, create rooms in front-end and connect different endpoints to it.

**Things you can do with Coraline-core**

 - [x] Create interactive lessons for educative purpose, there is also an official project for it: [Coraline-educative](https://github.com/CamiloTD/coraline-educative)
 - [x] Create interactive content for your business (Interactive screens, interactive catalogues, etc...)
 - [x] Create interactive screens for museums, and expositions

**Installation:**
```batch
	npm install coraline-core
```
**Basic usage:**
```javascript
	const Coraline = require('coraline-core'); // Import the library
	const io = require('socket.io')(); // Import socket.io
	const PORT = 8000
	
	io.listen(PORT); // Start Socket.io Server

	Coraline.createServer(io); // Configure Coraline server
	// Done! it's all you need to start working :D
```

**Running tests:**

```batch
	npm test
```

**Generating docs:**

```batch
	npm run generate-docs
```
The documentation will be generated in **./jsdoc** folder

**Donations:**

You can colaborate to the project by donating some pennies to this wallets, we appreciate your collaboration <3

**Bitcoin:** 1GRLN4C8U7TezPLa6cLHHdfSpSF3qHNuR5