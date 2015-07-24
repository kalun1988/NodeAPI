
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var socialSchema = mongoose.Schema({
        id           : String,
        heha_uid	:{
        	type: mongoose.Schema.Types.ObjectId,
        	ref : 'User'
        },
        social_uid           : String,
        platform      : String,
        raw      : Object
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Social', socialSchema);
