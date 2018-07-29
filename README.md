# coraline-core
**Coraline-core is the back-end library of the Coraline Project**

**If you are searching for the front-end client library, please look at:** [coraline-client](https://github.com/CamiloTD/coraline-client)

### About this:
This repository is not *"batteries included"*, that means its not made for creating coralines by itself, if you want to create interactive content, and not to contribute to **coraline-core** you may want to see: [coraline-cli](https://github.com/CamiloTD/coraline-cli)

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