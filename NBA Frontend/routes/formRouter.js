const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const Profile = require('../public/javascripts/Models/Profile');

// Multer setup for file upload
const upload = multer({
  dest: 'public/uploads/',
});

// Custom error formatter to return only the error message
const onlyMsgErrorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return msg;
};

// Route for getting the complaint form
router.get('/complaint', [
  // Validation for query parameters
  query('email')
    .if(query('email').exists())
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .normalizeEmail()
    .isEmail()
    .withMessage('Email must be a valid format'),
  query('complainee')
    .if(query('complainee').exists())
    .trim()
    .notEmpty()
    .withMessage('Name is required.'),
  query('Description')
    .if(query('Description').exists())
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),
  query('complaintCategory')
    .if(query('complaintCategory').exists())
    .notEmpty()
    .withMessage('Select a complaint category'),
], (req, res, next) => {
  const violations = validationResult(req);
  const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

  // Logging error messages
  console.log(errorMessages);

  // Rendering the complaint form page
  res.render('form-complaint', {
    title: 'Form Complaint',
    isSubmitted: false,
    err: errorMessages,
  });

  // Add a string to the user's session for this action
  if (req.cookies.actions) {
    req.session.actions = JSON.parse(req.cookies.actions);
  } else {
    req.session.actions = [];
  }

  const currentTime = new Date().toLocaleString();
  const actionMessage = `${req.cookies.username} viewed the Complaint form page at ${currentTime}`;
  req.session.actions.push(actionMessage);

  if (req.session.actions.length > 4) {
    req.session.actions.shift();
  }

  res.cookie('actions', JSON.stringify(req.session.actions));
});

// Route for submitting the complaint form
router.post('/complaint', upload.single('image'), [
  // Validation for form fields
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .normalizeEmail()
    .isEmail()
    .withMessage('Email must be a valid format'),
  body('complainee')
    .trim()
    .notEmpty()
    .withMessage('Name is required.'),
  body('Description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),
  body('complaintCategory')
    .notEmpty()
    .withMessage('Select a complaint category'),
  body('image').custom((value, { req }) => {
    if (req.file && (req.file.size < 1024 || req.file.size > 1024 * 1024 * 2)) {
      throw new Error('Uploaded file must be at least 1KB and at most 2MB');
    }
    if (req.file && !req.file.mimetype.startsWith('image/')) {
      throw new Error('Only Image files are allowed');
    }
    if (!req.file) {
      throw new Error('An Image file is Required');
    }
    return true;
  }),
], (req, res, next) => {
  const violations = validationResult(req);
  const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

  // Logging errors and file information
  console.log(violations);
  console.log(req.file);

  if (errorMessages['image']) {
    // Delete the uploaded file if there is an error related to the image
    fs.unlinkSync(req.file.path);
  } else {
    moveFile(req.file, __dirname + '/../public/images/');
  }

  if (req.cookies.actions) {
    req.session.actions = JSON.parse(req.cookies.actions);
  } else {
    req.session.actions = [];
  }

  const currentTime = new Date().toLocaleString();
  const actionMessage = `${req.cookies.username} submitted a complaint at ${currentTime}`;
  req.session.actions.push(actionMessage);

  if (req.session.actions.length > 4) {
    req.session.actions.shift();
  }

  res.cookie('actions', JSON.stringify(req.session.actions));

  // Rendering the complaint form page with submitted data and errors
  res.render('form-complaint', {
    title: 'Complaints',
    isSubmitted: true,
    submittedComplainee: req.body.complainee,
    submittedEmail: req.body.email,
    submittedComplaintCategory: req.body.complaintCategory,
    submittedComplaintDescription: req.body.complaintDescription,
    submittedResponseRequested: req.body.responseRequested === 'yes',
    submittedImageSource: `/images/${req.file.filename}-${req.file.originalname}`,
    err: errorMessages,
  });
});

// Route for viewing the profile form
router.get('/profile', [
  // Validation for query parameters
  query('profileTitle')
    .if(query('agreed').exists())
    .trim()
    .notEmpty()
    .withMessage('A title for your profile is required'),
  query('discord')
    .if(query('discord').exists())
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to a discord server'),
  query('twitter')
    .if(query('twitter').exists())
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to your Twitter'),
  query('youtube')
    .if(query('youtube').exists())
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to your YouTube channel'),
  query('website')
    .if(query('website').exists())
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to your website'),
], (req, res, next) => {
  const violations = validationResult(req);
  const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

  // Retrieve previously saved profile data from cookies
  let cookieData = {};
  if (req.cookies.profileData) {
    cookieData = JSON.parse(req.cookies.profileData);
  }

  if (req.cookies.actions) {
    req.session.actions = JSON.parse(req.cookies.actions);
  } else {
    req.session.actions = [];
  }

  const currentTime = new Date().toLocaleString();
  const actionMessage = `${req.cookies.username} viewed the Profile page at ${currentTime}`;
  req.session.actions.push(actionMessage);

  if (req.session.actions.length > 4) {
    req.session.actions.shift();
  }

  res.cookie('actions', JSON.stringify(req.session.actions));

  // Render the profile form page with previously saved data and validation errors
  res.render('form-profile', {
    title: 'Edit Profile',
    isSubmitted: false,
    submittedProfileTitle: cookieData.profileTitle || '',
    submittedFavouriteGame: cookieData.favouriteGame || '',
    submittedDiscord: cookieData.discord || '',
    submittedTwitter: cookieData.twitter || '',
    submittedYouTube: cookieData.youtube || '',
    submittedWebsite: cookieData.website || '',
    err: errorMessages,
  });
});

// Route for submitting the profile form
router.post('/profile', [
  // Validation for form fields
  body('profileTitle')
    .notEmpty()
    .withMessage('A title for your profile is required'),
  body('discord')
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to a discord server'),
  body('twitter')
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to your Twitter'),
  body('youtube')
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to your YouTube channel'),
  body('website')
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid link to your website'),
], (req, res, next) => {
  const profileData = {
    profileTitle: req.body.profileTitle,
    favouriteGame: req.body.favouriteGame,
    discord: req.body.discord,
    twitter: req.body.twitter,
    youtube: req.body.youtube,
    website: req.body.website,
  };

  if (req.body.rememberMe) {
    // If "Remember Me" is checked, set the cookie for 30 days
    res.cookie('profileData', JSON.stringify(profileData), { maxAge: 30 * 24 * 60 * 60 * 1000 });
  }

  const violations = validationResult(req);
  const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

  // If there are no validation errors, create a new Profile object
  if (!violations.errors.length > 0) {
    const profile = new Profile(
      req.body.profileTitle,
      req.body.favouriteGame,
      req.body.discord,
      req.body.twitter,
      req.body.youtube,
      req.body.website,
    );

    console.log(profile);
  }

  if (req.cookies.actions) {
    req.session.actions = JSON.parse(req.cookies.actions);
  } else {
    req.session.actions = [];
  }

  const currentTime = new Date().toLocaleString();
  const actionMessage = `${req.cookies.username} changed their profile information at ${currentTime}`;
  req.session.actions.push(actionMessage);

  if (req.session.actions.length > 4) {
    req.session.actions.shift();
  }

  res.cookie('actions', JSON.stringify(req.session.actions));

  // Render the profile form page with submitted data and errors
  res.render('form-profile', {
    title: 'Profile Form',
    isSubmitted: true,
    submittedProfileTitle: req.body.profileTitle,
    submittedFavouriteGame: req.body.favouriteGame,
    submittedDiscord: req.body.discord,
    submittedTwitter: req.body.twitter,
    submittedYouTube: req.body.youtube,
    submittedWebsite: req.body.website,
    err: errorMessages,
  });
});

// Function to move uploaded file to a new path
function moveFile(tempFile, newPath) {
  newPath += tempFile.filename + '-' + tempFile.originalname;
  fs.rename(tempFile.path, newPath, (err) => {
    if (err) throw err;
  });
}

module.exports = router;
