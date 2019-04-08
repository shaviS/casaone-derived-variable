const productPrimary = require('../../modules/models/product_primary.js');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const createPrimaryProduct = function(params) {
	let template = {
		title: params.title,
		description: params.description,
		price: params.price
	};
	let productData = new productPrimary(template);
	return new Promise((resolve, reject) => {
		productData.save(template, function(err, data) {
			if (!err) {
				resolve(data);
			} else {
				reject(err);
			}
		});
	});
};

const getPrimaryProduct = function(rule, field, options) {
	return new Promise((resolve, reject) => {
		productPrimary.find(rule, field, options, function(err, data) {
			if (!err) {
				resolve(data);
			} else {
				reject(err);
			}
		});
	});
};

module.exports = {
	createPrimaryProduct: createPrimaryProduct,
	getPrimaryProduct: getPrimaryProduct
};
