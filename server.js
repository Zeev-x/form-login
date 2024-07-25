const express = require('express');
const server = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const users = require(`${__dirname}/data/users.json`);
const config = require(`${__dirname}/config.json`);

const port = config.port;

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(session({
  secret: 'Reyette-secreet',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
server.use(passport.initialize());
server.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, (username, password, done) => {
  // Cari user di database
  const user = users.find((user) => user.username === username && user.password === password);
  if (user) {
    return done(null, user);
  } else {
    return done(null, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((user) => user.id === id);
  done(null, user);
});

// Login form
server.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

// Login route
server.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send('Username atau password salah');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Setel username di session
      req.session.username = user.username;
      res.redirect('/');
    });
  })(req, res, next);
});

// Logout route
server.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

// Protected route
server.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // Setel username di session
    var usrName = req.session.username;
    res.send(`Halo ${usrName} Selamat datang di server!`);
  } else {
    res.redirect('/login');
  }
});

// Error handling
server.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Terjadi kesalahan!');
});

// Jalankan server
server.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});
