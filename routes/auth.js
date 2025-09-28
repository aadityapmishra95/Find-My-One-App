// Paste the full auth.js code from the previous response here.
// This code handles POST requests to /signup and /login, and GET requests for Google auth.
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

// Signup Handle
router.post('/signup', (req, res) => {
    const { name, email, password, password2 } = req.body;
    // ... (Validation logic here) ...
    User.findOne({ email: email }).then(user => {
        if (user) {
            res.status(400).send('Email already exists');
        } else {
            const newUser = new User({ name, email, password });
            newUser.save()
                .then(user => {
                    res.redirect('/login.html'); // Success! Send to login page.
                })
                .catch(err => console.log(err));
        }
    });
});

// in routes/auth.js

// in routes/auth.js

// Login Handle
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email: email }).then(user => {
        if (!user) {
            return res.status(400).send('That email is not registered');
        }

        if (!user.password) {
            return res.status(400).send('This account was created using Google. Please use the "Login with Google" button.');
        }

        // If a password exists, proceed to compare it
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) { return next(err); }

            if (isMatch) {
                // --- THIS IS THE CRITICAL FIX ---
                // Establish a session using Passport's req.logIn() function.
                // This creates the "ID card" for the user.
                req.logIn(user, (err) => {
                    if (err) { return next(err); }
                    // Now that the session is created, redirect to the dashboard.
                    return res.redirect('/dashboard.html');
                });
            } else {
                res.status(400).send('Password incorrect');
            }
        });
    }).catch(err => next(err)); // Added catch for better error handling
});

// Auth with Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Callback route for google to redirect to
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    res.redirect('/dashboard.html'); // Success! Send to dashboard.
});
// Set New Password Handle
router.post('/reset-password', (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    // Basic validation
    if (newPassword !== confirmPassword) {
        return res.status(400).send('Passwords do not match.');
    }
    if (newPassword.length < 6) {
        return res.status(400).send('Password must be at least 6 characters long.');
    }

    // Find the user by the token AND make sure the token has not expired
    User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() } // $gt means "greater than" now
    })
    .then(user => {
        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        // If the token is valid, set the new password
        user.password = newPassword;
        // Clear the reset token fields so it can't be used again
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Save the updated user with the new password
        return user.save();
    })
    .then(() => {
        // You can redirect to a success page or just send a message
        res.send('Your password has been successfully updated! You can now <a href="/login.html">log in</a> with your new password.');
    })
    .catch(err => {
        console.error('RESET PASSWORD ERROR:', err);
        res.status(500).send('An error occurred while resetting the password.');
    });
});
// ✅ FILE: routes.js - The Routes File


import { Router } from 'express';


// Define a test route for items
router.get('/', (req, res) => {
    res.send('This is the route for getting all items.');
});

// Define a route for creating a new item
router.post('/', (req, res) => {
    // Logic to create a new item in the database will go here
    res.send('A new item has been created.');
});




router.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});


// Export a function that takes 'app' as an argument
default function setupRoutes(app) {
  app.use('/', router);
}
module.exports = router;