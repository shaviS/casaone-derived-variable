var Promise = require('bluebird');

var rabbit = require('./rabbit');

var EXCHANGE = 'taskExchange';
var TOPIC = 'taskRoutingKey';
var HOST_URL = 'amqp://localhost';

var publish = function(taskData) {
	return rabbit.publish(HOST_URL, EXCHANGE, TOPIC, taskData).catch(function(error) {
		return Promise.reject(error);
	});
};

var rePublish = function(data, maxRetries) {
	return rabbit.rePublish(HOST_URL, EXCHANGE, TOPIC, data, maxRetries).catch(function(error) {
		return Promise.reject(error);
	});
};

module.exports = {
	publish: publish,
	rePublish: rePublish
};
