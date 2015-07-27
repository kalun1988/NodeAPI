var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');
var restful = require('node-restful');
var flash    = require('connect-flash');
var session      = require('express-session');

var libs = process.cwd() + '/libs/';
require(libs + 'auth/auth');
var authUser  = require(libs + 'auth/user');

var config = require('./config');
var log = require('./log')(module);
var oauth2 = require('./auth/oauth2');

var api = require('./routes/api');
var users = require('./routes/users');
var articles = require('./routes/articles');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(cookieParser());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());



app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/', api);
app.use('/api', api);
app.use('/api/v1/members', users);



//register or login to HeHa
app.use('/api/oauth/token',[function(req, res, next) {
    authUser.registerOrLogin(req, res, next); 
},oauth2.token]);   //get accessToken by HeHa username and password (in req.body.username, req.body.password)
//use refreshToken to get an new accessToken
app.use('/api/oauth/refresh',oauth2.token);  


app.get('/auth/weibo', passport.authenticate('sina', { scope : ['profile', 'email'] }));

// the callback after weibo has authenticated the user
// app.get('/auth/weibo/callback',
//     passport.authenticate('sina', {
//         successRedirect : '/profile',
//         failureRedirect : '/fail'
//     }));

app.get('/auth/weibo/callback',
    passport.authorize('sina'),function(req, res){
        console.log("xxx");
        app.use(oauth2.token);
        //Not yet ready
        //mobile app use weibo SDK then pass profile value to gateway.
    });



app.get('/connect/weibo', passport.authorize('sina', { scope : ['profile', 'email'] }));

// the callback after weibo has authorized the user
app.get('/connect/weibo/callback',
    passport.authorize('sina', {
        successRedirect : '/profile',
        failureRedirect : '/fail'
    }));
// app.get('/unlink/weibo', isLoggedIn, function(req, res) {
//     var user          = req.user;
//     user.weibo.token = undefined;
//     user.save(function(err) {
//         res.redirect('/profile');
//     });
// });

app.get('/profile', function(req,res){
    res.send("Welcome");
});
app.get('/fail', function(req,res){
    res.send("Fail");
});


// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({ 
    	error: 'Not found' 
    });
    return;
});

// error handlers
// app.use(function(err, req, res, next){
//     res.status(err.status || 500);
//     log.error('%s %d %s', req.method, res.statusCode, err.message);
//     res.json({ 
//     	error: err.message 
//     });
//     return;
// });

module.exports = app;