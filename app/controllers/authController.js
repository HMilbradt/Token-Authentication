var User   = require('../models/user');
var jwt    = require('jsonwebtoken');
var config = require('../../config');
var bcrypt = require('bcrypt');
var profanity = require('profanity-util');

exports.register = (req, res) => {

  // validate username against rules
  var originalUsername = req.body.username;
  var originalPassword = req.body.password;

  if (!originalUsername && (originalUsername.length < 1 || (originalUsername.length > 20))) {
    return res.status(400).json({ success: false, message: 'Username must be between 1 and 20 characters.' });
  }

  if (!originalPassword && originalPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  // Check for profanity before querying database
  if (profanity.check(originalUsername).length > 0) {
    return res.status(400).json({ success: false, message: 'Username cannot contain any profanity.' });
  }

  User.findOne({
    username: originalUsername.toLowerCase()
  }, (err, user) => {

    if (err) throw err;

    if (user) {
      return res.status(400).json({ success: false, message: 'Username is taken.' });
    }

    // TODO: - validate password
    bcrypt.hash(originalPassword, 10, function(err, hash) {
      if (err) {
        return res.status(500).json({ success: false, message: "An unkown error occurred." })
      }

      var user = new User({
        displayName: originalUsername,
        username: originalUsername.toLowerCase(),
        password: hash,
        admin: false
      });

      user.save((err) => {

        // Payload to include in JWT access token
        const payload = {
            userId: user.id,
            admin: user.admin
        };

        // Token for future api calls
        var token = jwt.sign(payload, config.secret, {
            expiresIn: 604800 // expires in 1 week
        });

        // return the information including token as JSON
        res.status(200).json({
            success: true,
            token: token
        });
      });
    });
  });
}

exports.authenticate = (req, res) => {

  if ((!req.body.username && req.body.username.length) < 1 || (!req.body.password && req.body.password.length < 6)) {
    return res.status(400).json({ success: false, message: 'Username and password must both be supplied.' });
  }

  User.findOne({
    username: req.body.username.toLowerCase()
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      return res.status(401).json({ success: false, message: 'No user found matching supplied email and password.' });
    }

    bcrypt.compare(req.body.password, user.password, function(err, success) {

      if (err) throw err

      if (!success) {
        return res.status(401).json({ success: false, message: 'No user found matching supplied email and password.' });
      }

      const payload = {
        userId: user.id,
        admin: user.admin
      };
      var token = jwt.sign(payload, config.secret, {
        expiresIn: 604800 // expires in 1 week
      });

      // return the information including token as JSON
      res.status(200).json({
        success: true,
        token: token
      });
    });
  });
}

exports.isUsernameTaken = (req, res) => {

  var username = req.query.username;
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username must be supplied.' });
  }

  User.findOne({
    username: username.toLowerCase()
  }, function(err, user) {
    if (err) throw err;

    if (user) {
      res.status(200).json({ success: false, message: username + " is taken."});
    } else {
      res.status(200).json({ success: true, message: username + " is available."});
    }
  });
}

exports.refreshToken = (req, res) => {

  const payload = {
    userId: req.decoded.userId,
    admin: req.decoded.admin
  };
  var token = jwt.sign(payload, config.secret, {
    expiresIn: 604800 // expires in 1 week
  });

  // return the information including token as JSON
  res.status(200).json({
    success: true,
    token: token
  });
}
