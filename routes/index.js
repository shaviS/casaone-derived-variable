const express = require('express');
const router = express.Router();
const productController = require('../modules/controllers/productController');

const OKAY = 200;
const BAD_REQUEST = 400;
const UN_AUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const INTERNAL_ERROR = 500;

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/derivedProductInformation', function(req, res, next) {
	productController
		.getProductDerviedInformationPopulated()
		.then((data) => {
			res.status(OKAY).json(data);
		})
		.catch((err) => {
			res.status(INTERNAL_ERROR).json(err);
		});
});

router.post('/updateDerivedProductInformation', function(req, res, next) {
	const productId = req.body.productId;
	const timeToAssemble = req.body.timeToAssemble;

	if (productId && timeToAssemble) {
		productController
			.publishProductDerviedInformation(productId, timeToAssemble)
			.then((data) => {
				res.status(OKAY).json(data);
			})
			.catch((err) => {
				console.log(err);
				res.status(INTERNAL_ERROR).json(err);
			});
	} else {
		res.status(INTERNAL_ERROR).json('invalid input');
	}
});

module.exports = router;
