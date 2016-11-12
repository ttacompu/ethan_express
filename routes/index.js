var express = require('express');
var fortune = require("../library/fortune");
var router = express.Router();

var Vacation = require('../models/vacation.js');
var VacationInSeasonListener = require('../models/vacationInSeasonListener.js');


Vacation.find(function (err, vacations) {
    if (vacations.length) return;
    new Vacation({
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description: 'Spend a day sailing on the Columbia and ' +
        'enjoying craft beers in Hood River!',
        priceInCents: 9995,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0,
    }).save();
    new Vacation({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        priceInCents: 269995,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
    }).save();
    new Vacation({
        name: 'Rock Climbing in Bend',
        slug: 'rock-climbing-in-bend',
        category: 'Adventure',
        sku: 'B99',
        description: 'Experience the thrill of climbing in the high desert.',
        priceInCents: 289995,
        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
        inSeason: true,
        requiresWaiver: true,
        maximumGuests: 4,
        available: false,
        packagesSold: 0,
        notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});




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

router.get('/vacations', function (req, res) {
    Vacation.find({ available: true }, function (err, vacations) {
        var currency = req.session.currency || 'USD';
        var context = {
            vacations: vacations.map(function (vacation) {
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    price: vacation.getDisplayPrice(),
                    inSeason: vacation.inSeason,
                }
            })
        }

        switch (currency) {
            case 'USD': context.currencyUSD = 'selected'; break;
            case 'GBP': context.currencyGBP = 'selected'; break;
            case 'BTC': context.currencyBTC = 'selected'; break;
        }

        res.render('vacations', context)

    })
})

router.get('/notify-me-when-in-season', function (req, res) {
    res.render('notify-me-when-in-season', { sku: req.query.sku });
});

router.post('/notify-me-when-in-season', function (req, res) {
    VacationInSeasonListener.update(
        { email: req.body.email },
        { $push: { skus: req.body.sku } },
        { upsert: true },
        function (err) {
            if (err) {
                console.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: 'There was an error processing your request.',
                };
                return res.redirect(303, '/vacations');
            }
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'You will be notified when this vacation is in season.',
            };
            return res.redirect(303, '/vacations');
        }
    );
});

router.get('/set-currency/:currency', function (req, res) {
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations');

})

module.exports = router;
