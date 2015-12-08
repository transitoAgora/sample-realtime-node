var _ = require('lodash');
var ws = require('nodejs-websocket');
var kafka = require('kafka-node'),
	Consumer = kafka.Consumer,
	client = new kafka.Client("localhost:2181/"),
	consumer = new Consumer(
		client, [{
			topic: 'transito'
		}], {
			autoCommit: false
		}
	);
var clients = [];
var server = ws.createServer(function(conn) {
	conn.on('close', function() {
		console.log('close');
		var index = clients.indexOf(conn);
		clients.splice(index, 1);
	});
	conn.on('error', function() {});
	conn.on('text', function(text) {
		console.log(text);
		if (text === 'i am a client') {
			console.log('A new client');
			clients.push(conn);
		} else {
			clients.forEach(function(client) {
				try {
					client.sendText(text);
				} catch (e) {}
			});
		}
	});
	var tagFlow = {};
	consumer.on('message', function(message) {
		var obj = JSON.parse(message.value);
		if (!tagFlow[obj.tag]) {
			tagFlow[obj.tag] = _.throttle(function(message) {
				clients.forEach(function(client) {
					try {
						client.sendText(message.value);
					} catch (e) {}
				});
			}, 3000);
		}
		tagFlow[obj.tag](message);
		console.log(message);
	});
}).listen(8091);