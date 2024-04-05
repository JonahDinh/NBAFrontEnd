const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const session = require('express-session');
require('dotenv').config({path: 'env'});

// Define session options
const sessOptions = {
  secret: 'SecretForCookie', // Change the secret
  name: 'session-id',
  resave: false,
  saveUninitialized: false,
  cookie: {httpOnly: false, maxAge: 1000 * 60 * 60},
  unset: 'destroy',
};

// Configure Passport with Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.SECRET_ID,
      callbackURL: 'http://localhost:3456/oauth2/redirect',
    },
    function verify(issuer, profile, cb) {
      if (issuer === 'https://accounts.google.com') {
        return cb(null, profile);
      }
      return cb(new Error('Unauthorized'), null);
    },
  ),
);

// Serialize and deserialize user for Passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Initialize Express app
const app = express();

// Configure view engine and static files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(sessOptions.secret)); // Use the cookie-parser middleware
app.use((req, res, next) => {
  req.cookies = cookieParser.JSONCookies(req.cookies);
  next();
});
app.use(
  session({
    secret: 'SecretForCookie', // Change the secret
    name: 'session-id',
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: false, maxAge: 1000 * 60 * 60},
    unset: 'destroy',
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bw', express.static(__dirname + '/node_modules/bootswatch/dist'));

// Middleware to ensure user authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/login/google');
  }
}

// Routes
app.get('/login/google', passport.authenticate('google', {scope: ['profile']}));
app.get(
  '/oauth2/redirect',
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureMessage: true,
  }),
  (req, res) => {
    // Check if the user object has the necessary information
    if (req.user && req.user.name && req.user.name.givenName) {
      // Set the user's name as a cookie
      res.cookie('username', req.user.name.givenName, {
        maxAge: 1000 * 60 * 60 * 24 * 60,
        httpOnly: true,
      });
    }
    res.redirect('/');
  },
);

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.clearCookie('session-id');
    res.clearCookie('username');
    res.clearCookie('actions');
    res.redirect('https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout');
  });
});

app.use(ensureAuthenticated);

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/form', require('./routes/formRouter.js'));
const sessionsRouter = require('./routes/sessionsRouter.js');
app.use('/sessions', sessionsRouter);

// Error Handlers
app.use((req, res, next) => next(createError(404))); // Handle 404 errors
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
