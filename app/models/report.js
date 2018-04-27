// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Report', new Schema({
    messageId: {
        type: String,
        required: "A messageID is required."
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        required: "A report must be associated with a user.",
        ref: 'User'
    },
    dateReported: {
        type: Date,
        default: Date.now
    },
    open: {
        type: Boolean,
        default: true
    }
}));
