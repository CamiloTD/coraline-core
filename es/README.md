# coraline-core

**Coraline-core es una libreria back-end del proyecto Coraline**

**Si estas buscando por la libreria front-end, por favor buscala en:** [coraline-client](https://github.com/CamiloTD/coraline-client)

### Sobre esto:
Este repósitorio no tiene *"Baterias incluidas"*, esto sifnifica que no esta hecho para crear coralines por el mismo, si tu quieres crear contenido interactivo, y no contribuir a **coraline-core** te podria ser util mirar aqui: [coraline-cli](https://github.com/CamiloTD/coraline-cli)

**Instalacion:**
```batch
	npm install coraline-core
```
**Uso basico:**
```javascript
	const Coraline = require('coraline-core'); // Import the library
	const io = require('socket.io')(); // Import socket.io
	const PORT = 8000
	
	io.listen(PORT); // Start Socket.io Server

	Coraline.createServer(io); // Configure Coraline server
	// Done! it's all you need to start working :D
```

**Hacer pruebas:**

```batch
	npm test
```

**Generando documentos:**

```batch
	npm run generate-docs
```
La documentacion sera generada en la carpeta **./jsdoc**

**Donaciones:**

Tambien puedes colaborar a el proyecto donando algunos centavos a esta cartera, apreciamos tu colaboracion <3

**Bitcoin:** 1GRLN4C8U7TezPLa6cLHHdfSpSF3qHNuR5
