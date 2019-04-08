var primaryProductOperations = require('../accessors/productPrimaryOperations');
var derivedProductOperations = require('../accessors/productDerivedOperations');
const Promise = require('bluebird');
const derivedProductPublisher = require('../../rabbitMQ/derivedProductDataPublisher.js');

// create dummy database of 10 prducts
const createSampleDataBase = function() {
	return new Promise((resolve, reject) => {
		primaryProductOperations
			.getPrimaryProduct()
			.then((primaryProductData) => {
				if (primaryProductData && primaryProductData.length > 0) {
					resolve(true);
				} else {
					addPrimaryProducts(10).then((data) => {
						//console.log(data);
						addDerviedProductInformation(data).then((derivedProductData) => {
							console.log(derivedProductData);
							resolve(derivedProductData);
						});
					});
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
};

// create primaryProduct data for n products
const addPrimaryProducts = function(noOfProducts) {
	var promisList = [];
	for (let index = 0; index < noOfProducts; index++) {
		const primaryProductData = {
			title: 'title' + index,
			description: 'description' + index,
			price: 100 + index
		};
		promisList.push(primaryProductOperations.createPrimaryProduct(primaryProductData));
	}
	return new Promise((resolve, reject) => {
		Promise.all(promisList)
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

// creates dervied information data for n products

const addDerviedProductInformation = function(productData) {
	var promisList = [];
	for (let index = 0; index < productData.length; index++) {
		const derivedProductData = {
			timeToAssemble: '100' + index,
			secondaryAttribute1: 'secondaryAttribute1' + index,
			secondaryAttribute2: 10 + index,
			productId: productData[index]._id
		};
		promisList.push(derivedProductOperations.createDerivedProduct(derivedProductData));
	}
	return new Promise((resolve, reject) => {
		Promise.all(promisList)
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

const getProductDerviedInformationPopulated = function(rule) {
	return new Promise((resolve, reject) => {
		derivedProductOperations
			.getDerivedProductInformationPopulated(rule)
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

const updateProductDerviedInformation = (productId, timeToAssemble) => {
	return new Promise((resolve, reject) => {
		const query = {
			productId: productId
		};
		const updateData = {
			timeToAssemble: timeToAssemble
		};
		derivedProductOperations
			.updateDerivedProductInformation(query, updateData)
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

const publishProductDerviedInformation = (productId, timeToAssemble) => {
	return new Promise((resolve, reject) => {
		const query = {
			productId: productId
		};
		const updateData = {
			timeToAssemble: timeToAssemble
		};
		derivedProductPublisher
			.publish({ productId: productId, timeToAssemble: timeToAssemble })
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				reject(err);
			});
	});
};
module.exports = {
	createSampleDataBase: createSampleDataBase,
	getProductDerviedInformationPopulated: getProductDerviedInformationPopulated,
	updateProductDerviedInformation: updateProductDerviedInformation,
	publishProductDerviedInformation: publishProductDerviedInformation
};
