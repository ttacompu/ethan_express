var express = require('express');
var router = express.Router();

var fortunes = [
"Conquer your fears or they will conquer you.",
"Rivers need springs.",
"Do not fear what you don't know.",
"You will have a pleasant surprise.",
"Whenever possible, keep it simple.",
];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home');
});

router.get('/about', function (req, res, next) {
 var ranFortune= fortunes[Math.floor(Math.random() * fortunes.length)]
  res.render('about', {fortune : ranFortune});
});


module.exports = router;
