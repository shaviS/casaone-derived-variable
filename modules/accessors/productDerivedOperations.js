const productDerived = require('../../modules/models/product_secondary.js');
const mongoose = require('mongoose');
const Promise = require('bluebird');

let createSecondaryProduct = function(params) {
	let template = {
		timeToAssemble: params.timeToAssemble,
		secondaryAttribute1: params.secondaryAttribute1,
		secondaryAttribute2: params.secondaryAttribute2,

		productId: params.productId
	};
	let productData = new productSecondary(template);
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

const getDerivedProductInformationPopulated = function(rule) {
	return new Promise((resolve, reject) => {
		productDerived
			.find(rule)
			.populate([
				{
					path: 'productId'
				}
			])
			.exec(function(err, data) {
				if (!err) {
					resolve(data);
				} else {
					reject(err);
				}
			});
	});
};

const updateDerivedProductInformation = (rule, data) => {
	return new Promise((resolve, reject) => {
		productDerived.updateOne(rule, data, { new: true }, function(err, data) {
			if (!err) {
				resolve(data);
			} else {
				reject(err);
			}
		});
	});
};

module.exports = {
	createDerivedProduct: createSecondaryProduct,
	getDerivedProductInformationPopulated: getDerivedProductInformationPopulated,
	updateDerivedProductInformation: updateDerivedProductInformation
};
