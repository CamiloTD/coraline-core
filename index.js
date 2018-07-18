#!/usr/bin/env node

const repo = "github:CamiloTD/coraline-example";

let program = require('commander');
let download = require('download-git-repo');
let readline = require('readline-sync');
let colors = require('colors');

program.version('0.0.1');

program.command('init').action(function (dir, cmd) {
	if(!readline.keyInYN("Do you want to create a Coraline in this folder?")) {
		console.log("Operation aborted".red);
		process.exit(0);
	}

	console.log("Downloading repository from: ".green + repo);

	download(repo, process.cwd(), (err) => {
		if(err) throw err;

		console.log("Done. ".green);
		console.log("Use " + "npm install".green + " to install the dependencies");
	});
});

program.parse(process.argv);