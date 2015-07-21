
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var SinaStrategy = require('passport-sina').Strategy;

var libs = process.cwd() + '/libs/';

var config = require(libs + 'config');

var User = require(libs + 'model/user');
var Client = require(libs + 'model/client');
var AccessToken = require(libs + 'model/accessToken');
var RefreshToken = require(libs + 'model/refreshToken');

var Weibo = require(libs + 'model/weibo');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new BasicStrategy(
    function(username, password, done) {
        Client.findOne({ clientId: username }, function(err, client) {
            if (err) { 
            	return done(err); 
            }

            if (!client) { 
            	return done(null, false); 
            }

            if (client.clientSecret !== password) { 
            	return done(null, false); 
            }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) { 
            	return done(err); 
            }

            if (!client) { 
            	return done(null, false); 
            }

            if (client.clientSecret !== clientSecret) { 
            	return done(null, false); 
            }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {

            if (err) { 
            	return done(err); 
            }

            if (!token) { 
            	return done(null, false); 
            }

            if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {

                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) {
                    	return done(err);
                    } 
                });

                return done(null, false, { message: 'Token expired' });
            }

            User.findById(token.userId, function(err, user) {
            
                if (err) { 
                	return done(err); 
                }

                if (!user) { 
                	return done(null, false, { message: 'Unknown user' }); 
                }

                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));

  passport.use(new SinaStrategy({

        clientID        : '2250432332',
        clientSecret    : '5de392ba0d145bfb02e98aa55dec4926',
        callbackURL     : 'http://10.16.88.183:1337/auth/weibo/callback',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
        console.log('refreshToken'+refreshToken);
        // asynchronous
        process.nextTick(function() {
            // check if the user is already logged in
            User.findOne({ 'weibo.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                        saveUser(user, profile, token, done);
                        //handle login with / connect
                    // if there is a user id already but no token (user was linked at one point and then removed)
                    // if (!user.weibo.token) {
                    //     saveUser(user, profile, token, done);
                    // }else{
                    //     updateUser(user, profile, token, done);
                    // }

                    // return done(null, user);
                } else {
                    var newUser          = new User();
                    saveUser(newUser, profile, token, done);
                }
            });
            createAndSaveRaw(profile, token);
        });

    }));
    function createAndSaveRaw(profile, token){
        Weibo.findOne({ 'profile.id' : profile.id }, function(err, weibo) {
            // if (err)
            //     return done(err);
            if (weibo) {
                weibo.profile = profile;
                weibo.save(function(err) {
                    // if (err)
                    //     return done(err);
                    // done(profile, token, done)
                });
            } else {
                var newWeibo          = new Weibo();
                newWeibo.profile = profile;
                newWeibo.save(function(err) {
                    // if (err)
                    //     return done(err);
                    // done(profile, token, done)
                });
            }
        });
    }

    //follow scheme in user model
    function saveUser(user, profile, token, done){
        user.username="weibo"+profile.id;
        user.password="weibo"+profile.id;
        user.weibo={
                id:profile.id,
                token:token,
                name:profile.name,
                picture:profile.profile_image_url
            };
        user.save(function(err) {
            if (err)
                return done(err);
            return done(null, user);
        });
    }