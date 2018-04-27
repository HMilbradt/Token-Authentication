// =========================|
// get the packages we need |
// =========================|
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var config = require('./config');

var AuthController = require('./app/controllers/authController');
var Tokenator = require('./app/middleware/token');
var User   = require('./app/models/user');
var MessageController = require('./app/controllers/messageController');

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080;
mongoose.connect(config.database);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
    res.status(200).json({ success: true, message: "Coming soon: Page describing the app."})
});

// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.status(200).json({
    success: true,
    data: {
      "endpoints": {
        "/register": {
          "method": "POST",
          "description": "Registers a new user, returning an access token",
          "parameters": {
            "username": "string",
            "password": "string"
          }
        },
        "/register/username": {
          "method": "GET",
          "description": "Checks if username is valid.",
          "query parameters": {
            "username": "string"
          }
        },
        "/authenticate": {
          "method": "POST",
          "description": "Authenticates a user, returning a new access token.",
          "parameters": {
            "username": "string",
            "password": "string"
          }
        },
        "/messages/get": {
          "method": "GET",
          "desription": "Returns messages geolocated around the provided coordinates",
          "parameters": {
            "latitude": "double",
            "longitude": "double",
            "max_distance": "optional number",
            "limit": "optional number"
          }
        },
        "/messages/create": {
          "method": "POST",
          "description": "Creates a new geolocated message",
          "parameters": {
            "latitude": "double",
            "longitude": "double",
            "message": "0 < string < 51"
          }
        }
      }
    }
  });
});

apiRoutes.get('/auth/register/username/checkavailability', AuthController.isUsernameTaken);
apiRoutes.post('/auth/register', AuthController.register);
apiRoutes.post('/auth/authenticate', AuthController.authenticate);
apiRoutes.get('/auth/refresh', Tokenator.authorizeToken, AuthController.refreshToken);

// route middleware to verify a token
apiRoutes.use(Tokenator.authorizeToken);

apiRoutes.get('/messages/get', MessageController.get);
apiRoutes.post('/messages/create', MessageController.create);
apiRoutes.get('/messages/report', MessageController.report);

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
