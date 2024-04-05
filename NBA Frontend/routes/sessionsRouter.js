const express = require('express');
const router = express.Router();

// Add a new route to display user actions
router.get('/', function(req, res, next) {
  if (req.session.actions) {
    const actions = req.session.actions; // Retrieve the actions from the session
    res.render('actions', {actions}); // Render a view and pass the actions to it
  } else {
    res.send('No actions recorded.'); // Display a message if no actions are recorded
  }
});

module.exports = router;
