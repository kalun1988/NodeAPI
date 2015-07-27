var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var User = require(libs + 'model/user');
//require accesstoken
// User.before('get', function(req, res, next) {
//   passport.authenticate('bearer', function(err, user, info) {
//     if(!user.error){
//         next();
//     }else{
//         res.json({
//             error:user.error
//         });
//     }
//   })(req, res, next);
// });

User.register(router, '/');
//replace original NODEAPI by NODE RESTFUL API with passport
module.exports = router;