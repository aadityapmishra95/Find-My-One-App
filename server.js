const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

// Passport Config (we will create this file next)
require('./config/passport-setup');

const app = express();

// --- Database Connection ---
// Make sure MongoDB is running on your computer!
mongoose.connect('mongodb://localhost:27017/lostandfound', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.log(err));

// --- Middleware ---
// These are functions that run on every request.
app.use(express.urlencoded({ extended: false })); // Helps our server understand form data
app.use(express.json()); // Helps our server understand JSON data
app.use(express.static('public')); // Tells the server to make the 'public' folder accessible to the browser

// Express session
app.use(
    session({
        secret: 'a_very_secret_key_for_your_session', // Change this to a real secret
        resave: false,
        saveUninitialized: false,
    })
);

// Passport middleware (for login)
app.use(passport.initialize());
app.use(passport.session());

// in server.js

// --- Routes ---
// This tells the server how to handle different URLs.
app.use('/auth', require('./routes/auth')); // Any URL starting with /auth will be handled by auth.js
app.use('/api', require('./routes/api'));   // <<<--- ADD THIS LINE

// ... existing server.js code ...

// Catch all other requests and serve index.html
app.get('/', (req, res) => {
    // We now serve our new index.html as the landing page
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ... rest of your server.js code ...

// Export the app for Vercel
module.exports = app;