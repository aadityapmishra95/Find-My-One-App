// 1. IMPORT PACKAGES (ES Module Syntax)
// ==============================================
// Load .env variables
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import MongoStore from 'connect-mongo';

// CORRECT ✅
import express from 'express';
// ... other imports

const app = express();
const PORT = process.env.PORT || 3000; // <-- DECLARE PORT EARLY

// ... other middleware and code ...

// Now, it's safe to use PORT here
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

// 2. INITIALIZE APP & MIDDLEWARE
// ==============================================
// Sample data to act as a database
const users = [
  { id: 1, name: 'Alice', connection: 'Friend' },
  { id: 2, name: 'Bob', connection: 'Colleague' },
  { id: 3, name: 'Charlie', connection: 'Family' }
];
// This is your existing root route
app.get('/', (req, res) => {
  res.send('Welcome to the Find My One API! Server is running.');
});

// ---- NEW: ADD THE API ENDPOINT ----
app.get('/api/users', (req, res) => {
  // This sends the 'users' array back as a JSON response
  res.json(users);
});
// ---------------------------------

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Middlewares to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware - required for Passport
app.use(session({
    secret: process.env.SESSION_SECRET, // Make sure this is in your Vercel env variables
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI // Your MongoDB connection string
    })
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 3. DEFINE ROUTES
// ==============================================
app.get('/', (req, res) => {
    res.send('Welcome to the Find My One API! Server is running.');
});

// TODO: You will add your other application routes here

// 4. CONNECT TO DATABASE & START SERVER
// ==============================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostandfound';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });