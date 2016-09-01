const express = require('express');
const router = express.Router();

var Gest = require("../models/gest");

router.route('/')
  .get(function(req, res, next) {
    Gest.findAsync({}, null, {
        sort: {
          "text": 1
        }
      })
      .then(function(gest) {
        res.json(gest);
      })
      .catch(next)
      .error(console.error);
  })
  .post(function(req, res, next) {
    var gest = new Gest();
    gest.text = req.body.text;
    if (req.body.id) {
      gest._id = req.body.id;
    }
    gest.saveAsync()
      .then(function(category) {
        console.log("POST successful!");
        res.json({
          'status': 'success',
          'category': category
        });
      })
      .catch(function(e) {
        console.log("POST failed!");
        res.json({
          'status': 'error',
          'error': e
        });
      })
      .error(console.error);
  });

router.route('/:text')
  .get(function(req, res, next) {
    Gest.findOneAsync({
        text: req.params.text
      }, {
        text: 1,
      })
      .then(function(category) {
        res.json(category);
      })
      .catch(next)
      .error(console.error);
  })
  .put(function(req, res, next) {
    var gest = {};
    var prop;
    for (prop in req.body) {
      gest[prop] = req.body[prop];
    }
    Gest.findOneAndUpdateAsync({
        text: req.params.text
      }, gest)
      .then(function(updatedGest) {
        return res.json({
          'status': 'success',
          'category': updatedGest
        });
      })
      .catch(function(e) {
        return res.status(400).json({
          'status': 'fail',
          'error': e
        });
      })
  })
  .delete(function(req, res, next) {
    var textToDelete = req.params.text;
    var doc = {
      text: textToDelete
    }
    Gest.findOneAndRemoveAsync(doc)
      .then(function(deletedGest) {
        res.json({
          'status': 'success',
          'category': deletedGest
        });
      })
      .catch(function(e) {
        res.status(400).json({
          'status': 'fail',
          'error': e
        });
      });
  });

module.exports = router;
