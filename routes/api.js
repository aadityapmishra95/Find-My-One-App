const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Case = require('../models/Case');
const User = require('../models/User');

// --- Set Up Multer for File Storage ---
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).single('photo');

// --- API ROUTES ---

// @route   POST /api/cases
// @desc    Create a new missing person case
router.post('/cases', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ msg: 'Unauthorized. Please log in to report a case.' });
    }

    upload(req, res, (err) => {

        // --- ADD THIS DEBUGGING BLOCK ---
        console.log("--- 2. Data ARRIVING at the server: ---");
        console.log(req.body);
        //
        if (err) {
            return res.status(500).json({ msg: 'Error uploading file', error: err });
        }

        // Check if user provided at least one image
        if (!req.file && !req.body.imageURL) {
            // I noticed I previously made this check required, let's relax it for now.
            // You can add it back if you want to make an image mandatory.
        }
        
        const newCase = new Case({
            fullName: req.body.fullName,
            age: req.body.age,
            gender: req.body.gender,
            isUnder18: req.body.isUnder18 === 'on' ? true : false,
            lastSeenLocation: req.body.lastSeenLocation,
            lastSeenDate: req.body.lastSeenDate,
            description: req.body.description,
            photoPath: req.file ? `/uploads/${req.file.filename}` : '',
            imageURL: req.body.imageURL,
            reporterName: req.body.reporterName,
            reporterContact: req.body.reporterContact,
            reporterPhone: req.body.reporterPhone,
            reportedBy: req.user.id
        });

        // --- ADD THIS DEBUGGING BLOCK ---
        console.log("--- 3. Object being SAVED to database: ---");
        console.log(newCase);
        // 

        newCase.save()
            .then(caseDoc => res.status(201).json({ msg: 'Case reported successfully', case: caseDoc }))
            .catch(error => {
                console.error("!!! DATABASE SAVE ERROR:", error);
                res.status(500).json({ msg: 'Server error while saving', error: error.message });
            });
    });
});

// @route   GET /api/cases
// @desc    Get all active cases, with optional search filters
router.get('/cases', (req, res) => {
    let filter = { status: 'Active' };
    if (req.query.name) { filter.fullName = new RegExp(req.query.name, 'i'); }
    if (req.query.age) { filter.age = req.query.age; }
    if (req.query.location) { filter.lastSeenLocation = new RegExp(req.query.location, 'i'); }

    Case.find(filter).sort({ dateReported: -1 })
        .then(cases => res.json(cases))
        .catch(err => res.status(500).json({ msg: 'Error fetching cases', error: err }));
});

// @route   GET /api/user/me
// @desc    Get the currently logged-in user's information
router.get('/user/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }
    res.json({
        name: req.user.name,
        email: req.user.email,
        id: req.user.id // Also sending ID for the 'Mark as Found' feature
    });
});

// @route   GET /api/cases/mycases
// @desc    Get all cases reported by the currently logged-in user
router.get('/cases/mycases', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }
    Case.find({ reportedBy: req.user.id }).sort({ dateReported: -1 })
        .then(cases => res.json(cases))
        .catch(err => res.status(500).json({ msg: 'Error fetching cases', error: err }));
});

// @route   GET /api/cases/:id
// @desc    Get a single case by its unique ID
router.get('/cases/:id', (req, res) => {
    Case.findById(req.params.id)
        .then(caseDoc => {
            if (!caseDoc) {
                return res.status(404).json({ msg: 'Case not found' });
            }
            res.json(caseDoc);
        })
        .catch(err => {
            console.error("Error fetching single case:", err);
            res.status(500).json({ msg: 'Server error' });
        });
});
// @route   PATCH /api/cases/:id/status
// @desc    Update the status of a case
router.patch('/cases/:id/status', (req, res) => {
    // 1. Check if a user is logged in
    if (!req.isAuthenticated()) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }

    const { status } = req.body; // Get the new status from the request (e.g., "Found")
    const caseId = req.params.id;
    const userId = req.user.id;

    Case.findById(caseId)
        .then(caseDoc => {
            if (!caseDoc) {
                return res.status(404).json({ msg: 'Case not found' });
            }

            // 2. IMPORTANT SECURITY CHECK: 
            //    Ensure the person updating the case is the person who reported it.
            if (caseDoc.reportedBy.toString() !== userId) {
                return res.status(403).json({ msg: 'User not authorized to update this case' });
            }
            
            // 3. If everything is okay, update the status and save the document
            caseDoc.status = status;
            return caseDoc.save();
        })
        .then(updatedCase => {
            res.json(updatedCase); // Send back the updated case data
        })
        .catch(err => {
            console.error("STATUS UPDATE ERROR:", err);
            res.status(500).json({ msg: 'Server error' });
        });
});

module.exports = router;