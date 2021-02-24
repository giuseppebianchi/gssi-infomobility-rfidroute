var createError = require('http-errors');
var express = require('express');
var session = require("express-session")
var mysqlStore = require('express-mysql-session')(session);
var path = require('path');
var cors = require("cors")
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config()

var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var rfidRouter = require('./routes/rfid');
var schedulesRouter = require('./routes/schedules');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var settingsRouter = require('./routes/settings');

var app = express();

const port = process.env.PORT || 4000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/moment/min')); //redirect Moment js
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css')); // redirect CSS FontAwesome
//app.use('/static', express.static(__dirname + '/public/static/bus_recognizer')); // for prediction stops development

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

var mysql_options = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'rfidroute_session_store'
};

var sessionStore = new mysqlStore(mysql_options);

app.use(session({
  name: process.env.SESSION_NAME,
  saveUninitialized: false,
  resave: false,
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  cookie: {
    maxAge: parseInt(process.env.SESSION_LIFETIME),
    sameSite: true,
    secure: false //HTTPS
  }
}))

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);
app.use('/rfid', rfidRouter);
app.use('/schedules', schedulesRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/settings', settingsRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.locals.moment = require('moment');

app.listen(port, () => {
  console.log("Server is running on port: " + port)
})

module.exports = app;
