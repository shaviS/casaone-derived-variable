const Promise = require('bluebird');
const derivedProductPublisher = require('./derivedProductDataPublisher.js');
const productController = require('../modules/controllers/productController.js');

const rabbit = require('./rabbit');

const EXCHANGE = 'taskExchange';
const TOPIC = 'taskRoutingKey';
const HOST_URL = 'amqp://localhost';
const QUEUE_NAME = 'taskNotificationQueue';

const mongoose = require('mongoose');
const dbUrl = 'mongodb://127.0.0.1/casaone';
mongoose.connect(dbUrl, function(err) {});
mongoose.set('debug', true);

const doIt = function(task) {
	return new Promise((resolve, reject) => {
		productController
			.updateProductDerviedInformation(task.productId, task.timeToAssemble)
			.then((data) => {
				resolve(true);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

const worker = function(channel, msg) {
	// check retries & re-entries, dropping and stuff
	doIt(JSON.parse(msg.content.toString()))
		.then(function(flag) {
			console.log('Consumed..' + JSON.stringify(JSON.parse(msg.content)));
			channel.ack(msg);
		})
		.catch(function(error) {
			channel.ack(msg);
			derivedProductPublisher.rePublish(JSON.parse(msg.content.toString()), 3);
		});
};

rabbit
	.consume(worker, HOST_URL, EXCHANGE, TOPIC, QUEUE_NAME)
	.then(function() {
		console.log('Worker Started');
	})
	.catch(function(error) {
		console.log('Error Starting Worker');
	});
