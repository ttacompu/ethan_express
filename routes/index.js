var express = require('express');

var fortune = require("../library/fortune");

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home');
});

router.get('/about', function (req, res, next) {
  res.render('about', 
  {
    fortune : fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
  });
});


module.exports = router;
