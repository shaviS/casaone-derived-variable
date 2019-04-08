const amqp = require('amqplib/callback_api');
const Promise = require('bluebird');

const openPublisherChannels = {};
const openConsumerChannels = {};

// TODO: write re-connectable workers and channels
const createNewChannel = function(hostUrl) {
	return new Promise(function(resolve, reject) {
		amqp.connect(hostUrl, function(err, conn) {
			if (!err) {
				conn.createChannel(function(err, ch) {
					if (!err) {
						resolve(ch);
					} else {
						conn.close();
						reject(new Error('Failed to create rabbit channel'));
					}
				});
			} else {
				reject(new Error('Failed to create rabbit connection'));
			}
		});
	});
};

// only one channel per exchange for now.. can use pool in future if needed.
const getPublisherChannel = function(hostUrl, exchange, type, isDurable) {
	if (openPublisherChannels[exchange]) {
		return openPublisherChannels[exchange];
	} else {
		const promise = createNewChannel(hostUrl).then(function(channel) {
			channel.assertExchange(exchange, type, { durable: isDurable });
			channel.on('close', function() {
				// TODO: add sms/slack or something
			});
			return channel;
		});

		if (!openPublisherChannels[exchange]) {
			openPublisherChannels[exchange] = promise;
		} else {
			promise.then(function(channel) {
				channel.close(function(err) {
					if (err) {
					}
				});
			});
		}
		return openPublisherChannels[exchange];
	}
};

const getConsumerChannel = function(hostUrl, exchange, type, isDurable) {
	if (openConsumerChannels[exchange]) {
		return openConsumerChannels[exchange];
	} else {
		const promise = createNewChannel(hostUrl).then(function(channel) {
			channel.assertExchange(exchange, type, { durable: isDurable });
			channel.on('close', function() {
				// TODO: add sms/slack or something
			});
			return channel;
		});

		if (!openConsumerChannels[exchange]) {
			openConsumerChannels[exchange] = promise;
		} else {
			promise.then(function(channel) {
				channel.close(function(err) {
					if (err) {
					}
				});
			});
		}
		return openConsumerChannels[exchange];
	}
};

const publishToChannel = function(channel, exchange, topic, data, isPersistent) {
	return new Promise(function(resolve, reject) {
		try {
			channel.publish(exchange, topic, new Buffer(JSON.stringify(data)), { persistent: isPersistent });
			resolve(true);
		} catch (error) {
			reject(new Error('Publish to rabbitmq failed'));
		}
	});
};

const assignConsumerToChannel = function(consumer, channel, exchange, topic, queueName, isDurable) {
	return new Promise(function(resolve, reject) {
		try {
			channel.assertQueue(queueName, { durable: isDurable }, function(err, q) {
				channel.bindQueue(q.queue, exchange, topic);
				channel.prefetch(1);

				channel.consume(
					q.queue,
					function(msg) {
						consumer(channel, msg);
					},
					{ noAck: false }
				);
			});

			resolve(true);
		} catch (error) {
			reject(new Error('Consume from rabbitmq failed'));
		}
	});
};

const publish = function(hostURL, exchange, topic, data) {
	return getPublisherChannel(hostURL, exchange, 'direct', true).then(function(channel) {
		return publishToChannel(channel, exchange, topic, data, true);
	});
};

const consume = function(worker, hostURL, exchange, topic, queueName) {
	return getConsumerChannel(hostURL, exchange, 'direct', true).then(function(channel) {
		return assignConsumerToChannel(worker, channel, exchange, topic, queueName, true);
	});
};

const rePublish = function(hostURL, exchange, topic, data, maxRetries) {
	return getPublisherChannel(hostURL, exchange, 'direct', true).then(function(channel) {
		if (data._retries) {
			if (data._retries >= maxRetries) {
				throw new Error('rePublish Failed: max retries exceeded');
			} else {
				data._retries = data._retries + 1;
			}
		} else {
			data._retries = 1;
		}
		return publishToChannel(channel, exchange, topic, data, true);
	});
};

module.exports = {
	getPublisherChannel: getPublisherChannel,
	getConsumerChannel: getConsumerChannel,
	publishToChannel: publishToChannel,
	assignConsumerToChannel: assignConsumerToChannel,

	// for ease of use..
	publish: publish,
	consume: consume,
	rePublish: rePublish,
	createNewChannel: createNewChannel
};
