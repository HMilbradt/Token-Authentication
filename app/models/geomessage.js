// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('GeoMessage', new Schema({
    message: {
        type: String,
        required: "A message is required."
    },
    location: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: "The coordinates are required."
        },
        altitude: {
            type: Number,
            required: "Altitude is required"
        }
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        required: "A message must be associated with a user.",
        ref: 'User'
    }
}));
