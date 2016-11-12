var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');

var mongoose = require('mongoose');

var opts = {
  server: {
    socketOptions: { keepAlive: 1 }
  }
}

var MongoSessionStore = require('connect-mongo')(session);



  //var users = require('./routes/users');

  var credentials = require('./credentials');

  var app = express();

  switch (app.get('env')) {
    case 'development':
      mongoose.connect(credentials.mongo.development.connectionString, opts);
      break;
    case 'production':
      mongoose.connect(credentials.mongo.production.connectionString, opts);
      break;
    default:
      throw new Error('Unknown execution environment: ' + app.get('env'));
  }

  var handlebars = require('express-handlebars');

  app.engine('.html', handlebars({
    defaultLayout: 'main', extname: '.html', helpers: {
      section: function (name, options) {
        if (!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      }
    }
  }));
  app.set('view engine', '.html');


  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(session({
    secret : credentials.cookieSecret,
    store : new MongoSessionStore({
      url : credentials.mongo.development.connectionString
    }),
    resave: true,
    saveUninitialized: true
  }))
  
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
  });

  app.use(function (req, res, next) {
    // if there's a flash message, transfer
    // it to the context, then clear it
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
  });

  app.use('/', routes);


  // error handlers
  // development error handler
  // will print stacktrace
  // 404 catch-all handler (middleware)
  app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
  });


  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
  });


  module.exports = app;
