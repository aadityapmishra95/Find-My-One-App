const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function() { return !this.googleId; } // Password not needed if using Google login
    },
    googleId: {
        type: String,
    }
});

// This part runs BEFORE a new user is saved to the database.
// It takes the user's password and "hashes" it, which means scrambling it for security.
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;