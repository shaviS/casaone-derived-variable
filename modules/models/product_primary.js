var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productPrimarySchema = new Schema(
  {
    title: {type: String, required: true, max: 100},
    description: {type: String, required: true, max: 100},
    price: {type: Number},
  }
);


//Export model
module.exports = mongoose.model('productPrimary', productPrimarySchema);