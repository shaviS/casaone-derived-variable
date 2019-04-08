var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productSecondarySchema = new Schema(
  {
    timeToAssemble: {type: Number},
    secondaryAttribute1: {type: String},
    secondaryAttribute2: {type: Number},
    productId : {type: mongoose.Schema.Types.ObjectId, ref: 'productPrimary', required: true, unique : true},
  }
);


//Export model
module.exports = mongoose.model('productDerived', productSecondarySchema);