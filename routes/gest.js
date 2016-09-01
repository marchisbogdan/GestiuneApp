var express = require('express');
var router = express.Router();
var Gest = require('../models/gest');
router.get('/', function(req, res, next) {
  // Gest.find(function(err, categories) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   res.render('gest', {
  //     title: "Gest",
  //     categories: categories
  //   });
  // })
  // Gest.findAsync()
  //   .then(function(categories) {
  //     res.render('gest', {
  //       title: "Gest",
  //       categories: categories
  //     });
  //   })
  //   .catch(next)
  //   .error(console.error);
  res.render('gest', {
    title: "Gest"
  });
});
module.exports = router;
