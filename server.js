// 1. IMPORT PACKAGES
// ==============================================
// Using ES Module syntax for all imports
import 'dotenv/config'; // Loads environment variables from .env file
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import cors from 'cors'; // For handling cross-origin requests from a front-end

// --- Import your route files here ---
import authRoutes from './routes/auth.js';
// In server.js - CORRECT for a named export
import { itemRoutes } from './routes/api.js';


// 2. INITIALIZE APP & CONSTANTS
// ==============================================
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;


// 3. MIDDLEWARE SETUP
// ==============================================
// Enable CORS for all routes, allowing your front-end to connect
app.use(cors()); 

// Middleware to parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware - configured to store sessions in MongoDB
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI
    })
}));

// Passport Middleware for authentication
app.use(passport.initialize());
app.use(passport.session());


// 4. API ROUTES
// ==============================================
// A simple test route to confirm the server is running
app.get('/', (req, res) => {
    res.send('Welcome to the Find My One API! Server is running.');
});

// --- Use your imported route files here ---
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);


// 5. DATABASE CONNECTION & SERVER START
// ==============================================
mongoose.connect(MONGO_URI)
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