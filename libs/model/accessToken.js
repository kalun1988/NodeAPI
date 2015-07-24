var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');

// AccessToken
var AccessToken = new Schema({
    userId: {
        type: String,
        required: true
    },

    clientId: {
        type: String,
        required: true
    },

    token: {
        type: String,
        unique: true,
        required: true
    },
    
    created: {
        type: Date,
        default: Date.now,
      index: {
        expireAfterSeconds: config.get('security:tokenLife')
      }
    }
});

module.exports  = mongoose.model('AccessToken', AccessToken);