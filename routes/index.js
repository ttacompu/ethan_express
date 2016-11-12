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
            fortune: fortune.getFortune(),
            pageTestScript: '/qa/tests-about.js'
        });
});

router.get('/newsletter', function (req, res, next) {
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

router.get('/newsletter/archive', function (req, res, next) {
    res.render('archive');
});

router.get('/thankyou', function (req, res, next) {
    

    res.render('thankyou');
})

router.post('/process', function (req, res, next) {

    if (req.xhr || req.accepts('json,html') === 'json') {
        res.send({ success: true });
    } else {
        console.log('Form (from querystring): ' + req.query.form);
        console.log('CSRF token (from hidden form field): ' + req.body._csrf);
        console.log('Name (from visible form field): ' + req.body.name);
        console.log('Email (from visible form field): ' + req.body.email);

        req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'You have now been signed up for the newsletter.'};

        res.redirect(303, '/thankyou');
    }
})

module.exports = router;
