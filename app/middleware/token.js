var jwt = require('jsonwebtoken');
var config = require('../../config');

exports.authorizeToken = (req, res, next) => {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });

    } else {

      return res.status(403).json({
          success: false,
          message: 'No token provided.'
      });
    }
}