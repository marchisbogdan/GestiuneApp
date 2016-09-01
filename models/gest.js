// var categories = [
//   'QR',
//   'Bill',
//   'QR',
//   'qqq'
// ];

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');
Promise.promisifyAll(mongoose);
var GestSchema = new Schema({
  // _id: {
  //   type: 'Number'
  // },
  text: {
    type: 'String',
    required: true
  }
});
// gests is the collection in the gest DB
// mongoose looks for the plural of the word, thats why i have set it to gests
var Gest = mongoose.model('gests', GestSchema);
module.exports = Gest;
//module.exports = categories;
