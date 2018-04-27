var GeoMessage = require('../models/geomessage');
var Report = require('../models/report');
var profanity = require('profanity-util');

exports.get = (req, res) => {

  // Values for limiting query
  var maxDistance = parseFloat(req.query.max_distance) | 10000;
  var limit = parseInt(req.query.limit) | 10;

  // get coordinates [<longitude>,<latitude>]
  var coords = [];
  coords[0] = req.query.longitude || 0;
  coords[1] = req.query.latitude || 0;

  GeoMessage.find({
    location: {
        $near: {
          $geometry : {
              type : "Point",
              coordinates: coords
            },
          $maxDistance: maxDistance
        }
      }
  }).limit(limit).exec(function(err, locations) {
    if (err) {
      return res.status(500).json(err);
    }

    return res.status(200).json(locations);
  });
}

/* Create a new message */
exports.create = (req, res) => {

  // censor message and validate length
  let dirtyMessageBody = req.body.message;
  if (!dirtyMessageBody) {
    return res.status(400).json({ success: false, data: "Message is required."});
  }
  let messageBody = profanity.purify(dirtyMessageBody)[0];
  if (messageBody.length < 1 || messageBody.length > 50) {
    return res.status(400).json({ success: false, data: "Message must be at least 1 character, up to 50 characters"});
  }

  let latitude = req.body.latitude;
  let longitude = req.body.longitude;

  if (!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ success: false, data: "Invalid coordinates given"});
  }

  let altitude = req.body.altitude;
  if (isNaN(altitude) || altitude < 0) {
    return res.status(400).json({ success: false, data: "Altitude is required" });
  }

  let message = new GeoMessage({
    message: messageBody,
    location: {
      type: "Point",
      coordinates: [
        req.body.longitude,
        req.body.latitude
      ],
      altitude: altitude
    },
    postedBy: req.decoded.userId
  });

  message.save((err) => {

    if (err) {
      return res.status(500).json({ successs: false, error: err });
    }

    return res.status(200).json({ success: true, data: message});
  });
}

exports.report = (req, res) => {

  var messageId = req.query.message_id;

  if (!messageId) {
    return res.status(400).json({ success: false, data: "Messageid is required"});
  }

  Report.findOne({
    messageId: messageId,
    reportedBy: req.decoded.userId
  }, (err, report) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (report) {
      return res.status(400).json({ success: false, data: "You cannot report a message twice."});
    }

    GeoMessage.findById(messageId, (err, message) => {

      if (err) {
        return res.status(404).json({ success: false, data: "Message not found."});
      }

      if (!message) {
        return res.status(404).json({ success: false, data: "Message not found."});
      }

      var report = new Report({
        messageId: message.id,
        reportedBy: req.decoded.userId
      });

      report.save((err) => {
        return res.status(200).json({ success: true, message: "Message has been reported.  Thanks!"});
      });
    });
  });
}