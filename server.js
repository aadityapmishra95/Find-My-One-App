// 1. IMPORT PACKAGES
// ==============================================
// Must be at the very top to ensure environment variables are available globally
// Only load .env variables in development
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}


const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: process.env.SESSION_SECRET, // Make sure this is in your Vercel env variables
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI // Your existing MongoDB connection string
    })
}));


// 2. INITIALIZE APP & MIDDLEWARE
// ==============================================
const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env file, or default to 3000

// Middlewares to parse request bodies
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Session Middleware - required for Passport
app.use(session({
    secret: process.env.SESSION_SECRET, // A random secret key stored in your .env file
    resave: false,
    saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


// 3. DEFINE ROUTES
// ==============================================
// A simple homepage route to test if the server is working
app.get('/', (req, res) => {
    res.send('Welcome to the Find My One API! Server is running.');
});

// TODO: You will add your other application routes here
// Example:
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);


// 4. CONNECT TO DATABASE & START SERVER
// ==============================================
// Get the MongoDB connection string from the .env file
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostandfound';

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
        
        // Start the Express server ONLY after the database connection is successful
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with an error code
    });