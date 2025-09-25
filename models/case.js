const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    // --- Missing Person's Info ---
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: false },
    isUnder18: { type: Boolean, default: false },
    lastSeenLocation: { type: String, required: true },
    lastSeenDate: { type: Date, required: false },
    description: { type: String, required: true },
    photoPath: { type: String, required: false },
    imageURL: { type: String, required: false },

    // --- Reporter's Info ---
    reporterName: { type: String, required: true },
    reporterContact: { type: String, required: true },
    reporterPhone: { type: String, required: false },

    // --- System Info ---
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: { type: String, default: 'Active' },
    dateReported: { type: Date, default: Date.now },
});

const Case = mongoose.model('Case', CaseSchema);
module.exports = Case;