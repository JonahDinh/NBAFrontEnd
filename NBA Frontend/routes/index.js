const express = require('express');
const router = express.Router();
const Team = require('../public/javascripts/Models/Team');
const Player = require('../public/javascripts/Models/Player');

// Cookie Action Section
router.get('/', async function (req, res, next) {
  if (req.cookies.actions) {
    req.session.actions = JSON.parse(req.cookies.actions);
  } else {
    req.session.actions = [];
  }

  const currentTime = new Date().toLocaleString();
  const actionMessage = `${req.cookies.username} viewed the Home page at ${currentTime}`;
  req.session.actions.push(actionMessage);

  if (req.session.actions.length > 4) {
    req.session.actions.shift();
  }

  res.cookie('actions', JSON.stringify(req.session.actions));

  try {
    // Fetch to get every team displayed
    const teamArray = await fetchTeam();
    res.render('index', {
      title: 'NBA Team Information',
      teamArray,
      submittedTeam: teamArray[0],
      isSubmitted: false,
    });
  } catch (error) {
    // Handle error
  }
});

// Post Request Section
router.post('/', async function (req, res, next) {
  try {
    // Fetch to get the players from the team that was given to the server via POST
    const playerArray = [];
    const playerArrays = await fetchPlayer(playerArray, req.body.name);
    const teamArray = await fetchTeam();
    const submittedTeam = findTeam(teamArray, req.body.SeeMoreInfoBtn);

    // Cookie Action Section (repeated code)
    if (req.cookies.actions) {
      req.session.actions = JSON.parse(req.cookies.actions);
    } else {
      req.session.actions = [];
    }

    const currentTime = new Date().toLocaleString();
    const actionMessage = `${req.cookies.username} viewed the ${submittedTeam.name} page at ${currentTime}`;
    req.session.actions.push(actionMessage);

    if (req.session.actions.length > 4) {
      req.session.actions.shift();
    }

    res.cookie('actions', JSON.stringify(req.session.actions));

    res.render('index', {
      title: 'NBA Team Information',
      teamName: req.body.name,
      playerArrays,
      teamArray,
      submittedTeam,
      isSubmitted: true,
    });
  } catch (error) {
    // Handle error
  }
});

// Function to find a team by name
function findTeam(teams, teamName) {
  for (const team of teams) {
    if (team.name === teamName) {
      return team; // Return the whole team object if the name matches
    }
  }
  return null; // Return null if no matching team is found
}

// Fetch all NBA teams
async function fetchTeam() {
  try {
    const response = await fetch('https://www.balldontlie.io/api/v1/teams');
    if (!response.ok) {
      throw new Error('Network problem: Status was not Ok: ' + response.status);
    }

    const jsonArray = await response.json();
    const retTeam = [];

    for (const team of jsonArray.data) {
      const NBATeam = new Team(team.abbreviation, team.city, team.conference, team.full_name);
      retTeam.push(NBATeam);
    }

    return retTeam;
  } catch (error) {
    // Handle error
  }
}

// Fetch NBA players for a specific team
async function fetchPlayer(retPlayer, playerteam) {
  let URLString;

  for (let counter = 45; counter < 50; counter++) {
    URLString = 'https://www.balldontlie.io/api/v1/players/?page=' + counter + '&&per_page=100';

    try {
      const response = await fetch(URLString);
      if (!response.ok) {
        throw new Error('Network problem: Status was not Ok: ' + response.status);
      }

      const jsonArray = await response.json();

      for (const players of jsonArray.data) {
        const NBAPlayer = new Player(
          players.id,
          players.first_name,
          players.last_name,
          players.position,
          players.team.abbreviation
        );

        if (!NBAPlayer.position == '' && players.team.abbreviation == playerteam) {
          retPlayer.push(NBAPlayer);
        }
      }
    } catch (error) {
      // Handle error
    }
  }

  return retPlayer;
}

module.exports = router;
