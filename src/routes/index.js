var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');

var Item = mongoose.model('Item');
var Location = mongoose.model('Location');
var User = mongoose.model('User');

/**
 * Index/welcome page route
 */
router.get('/', function (req, res) {
    if (req.user) {
        res.redirect('dashboard');
    } else {
        res.render('index', {});
    }
});

/**
 * Login route
 */
router.get('/login', function (req, res) {
    res.render('login', {user: req.user, message: req.flash('err')});
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (user) {
            req.logIn(user, function () {
                res.redirect('/dashboard');
            });
        } else {
            req.flash('err', 'Your login or password is incorrect.');
            res.redirect('/login');
        }
    })(req, res, next);
});

/**
 * Register route
 */
router.get('/register', function (req, res) {
    res.render('register', {message: req.flash('err')});
});

router.post('/register', function (req, res) {
    if (!req.body.password) {
        req.flash('err', 'Please enter a valid password.');
        res.redirect('/register');
    }
    User.register(new User({username: req.body.username}),
        req.body.password, function (err) {
            if (err) {
                req.flash('err', 'Your username is already taken.');
                res.redirect('/register');
            } else {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/dashboard');
                });
            }
        });
});

/**
 * Logout route
 */
router.get('/logout', function (req, res) {
    if (req.user) {
        req.logout();
        res.redirect('/');
    } else {
        req.flash('err', 'You are not logged in.');
        res.redirect('/register');
    }
});

/**
 * Dashboard route
 */
router.get('/dashboard', function (req, res) {
    if (req.user) {
        User.findOne({username: req.user.username}).populate('locations').exec(function (err, user) {
            if (err) {
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.render('dashboard', {message: req.flash('err')});
            } else if (!user) {
                req.flash('err', 'User not found (this shouldn\'t have happened)!');
                res.render('dashboard', {message: req.flash('err')});
            } else {
                res.render('dashboard', {user: user, message: req.flash('err')});
            }
        });
    } else {
        req.flash('err', 'Please login to continue.');
        res.redirect('/login');
    }
});

/**
 * Profile route
 */
router.get('/profile', function (req, res) {
    if (req.user) {
        User.findOne({username: req.user.username}).populate({
            path: 'locations',
            populate: {
                path: 'items',
                model: 'Item'
            }
        }).exec(function (err, user) {
            if (err) {
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.redirect('/dashboard');
            } else if (!user) {
                req.flash('err', 'User not found (this shouldn\'t have happened)!');
                res.redirect('/dashboard');
            } else {
                var userStats = {};
                userStats.numItems = user.locations.reduce(function (a, b) {
                    return a + b.items.reduce(function (t, c) {
                            return t + c.quantity;
                        }, 0);
                }, 0);
                userStats.username = user.username;
                userStats.numLocations = user.locations.length;
                res.render('profile', {user: user, stats: userStats});
            }
        });
    } else {
        req.flash('err', 'Please login to continue.');
        res.redirect('/login');
    }
});

/**
 * Detail view route
 */
router.get('/detail/:title', function (req, res) {
    if (req.user) {
        Location.findOne({
            user: req.user._id,
            title: req.params.title
        }).populate('items').exec(function (err, location) {
            if (err) {
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.redirect('/dashboard');
            } else if (location) {
                User.findOne({username: req.user.username}).populate('locations').exec(function (err, user) {
                    res.render('detail', {location: location, user: user});
                });
            } else {
                req.flash('err', 'Location does not exist!');
                res.redirect('/dashboard');
            }
        });
    } else {
        req.flash('err', 'Please login to continue.');
        res.redirect('/login');
    }
});

/**
 * Delete location route
 */
router.post('/deleteLocation', function (req, res) {
    if (req.user) {
        User.findOneAndUpdate({username: req.user.username}, {$pull: {locations: req.body.locationId}}, function (err, user) {
            if (err) {
                console.log(err);
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.redirect('/dashboard');
            } else if (user) {
                Location.findOne({
                    user: req.user._id,
                    _id: req.body.locationId
                }).populate('items').exec(function (err, location) {
                    if (err) {
                        req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                        res.redirect('/dashboard');
                    } else if (location) {
                        for (var i = 0; i < location.items.length; i++) {
                            location.items[i].remove();
                        }
                        location.save(function (err) {
                            if (err) {
                                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                                res.redirect('/dashboard');
                            } else if (location) {
                                location.remove();
                                res.redirect('/dashboard');
                            } else {
                                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                                res.redirect('/dashboard');
                            }
                        });
                    } else {
                        req.flash('err', 'Location does not exist!');
                        res.redirect('/dashboard');
                    }
                });
            } else {
                req.flash('err', 'User does not exist!');
                res.redirect('/dashboard');
            }
        });
    } else {
        req.flash('err', 'Please login to continue.');
        res.redirect('/login');
    }
});

/**
 * Delete item route
 */
router.post('/location/:title/deleteItem', function (req, res) {
    if (req.user) {
        Location.findOneAndUpdate({title: req.params.title, user: req.user._id}, {$pull: {items: req.body.itemId}}, function (err, location) {
            if (err) {
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.redirect('/dashboard');
            } else if (location) {
                Item.findOneAndRemove({_id: req.body.itemId}, function (err) {
                    if (err) {
                        req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                        res.redirect('/detail/' + location.title);
                    } else {
                        res.redirect('/detail/' + location.title);
                    }
                });
            } else {
                req.flash('err', 'Location does not exist!');
                res.redirect('/dashboard');
            }
        });
    } else {
        req.flash('err', 'Please login to continue.');
        res.redirect('/login');
    }
});


/**
 * Move item route
 */
router.post('/location/:title/moveItem', function (req, res) {
    if (req.user) {
        Location.findOneAndUpdate({title: req.params.title, user: req.user._id}, {$pull: {items: req.body.itemId}}, function (err, location) {
            if (err) {
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.redirect('/dashboard');
            } else if (location) {
                Item.findOne({_id: req.body.itemId}, function (err, item) {
                    if (err) {
                        req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                        res.redirect('/dashboard');
                    } else if (location) {
                        Location.findOne({title: req.body.moveLocationId}).populate('items').exec(function (err, newlocation) {
                            if (err) {
                                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                                res.redirect('/dashboard');
                            } else if (newlocation) {
                                newlocation.items.push(item);
                                newlocation.save(function (err) {
                                    if (err) {
                                        req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                                        res.redirect('/dashboard');
                                    }
                                    res.redirect('/dashboard');
                                });
                            } else {
                                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                                res.redirect('/dashboard');
                            }
                        });
                    } else {
                        req.flash('err', 'Destination location does not exist!');
                        res.redirect('/dashboard');
                    }
                });
            } else {
                req.flash('err', 'Source location does not exist!');
                res.redirect('/dashboard');
            }
        });
    } else {
        req.flash('err', 'Please log in to continue.');
        res.redirect('/login');
    }
});

/**
 * Update location route
 */
router.post('/updateLocation', function (req, res) {
    if (req.user) {
        Location.findOneAndUpdate({_id: req.body.locationId, user: req.user._id}, {description: req.body.locationDesc}, function (err, location) {
            if (err) {
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.redirect('/dashboard');
            } else if (location) {
                res.redirect('/detail/' + location.title);
            } else {
                req.flash('err', 'Location does not exist!');
                res.redirect('/dashboard');
            }
        });
    } else {
        req.flash('err', 'Please log in to continue.');
        res.redirect('/login');
    }
});

/**
 * Update item route
 */
router.post('/updateItem', function (req, res) {
    if (req.user) {
        Item.findOneAndUpdate({_id: req.body.itemId, user: req.user._id}, {description: req.body.itemDesc, quantity: req.body.itemQuantity}, function (err, item) {
            if (err) {
                req.flash('err', 'Something bad happened on our end. Maybe try again later!');
                res.redirect('/dashboard');
            } else if (item) {
                res.redirect('/detail/' + req.body.locationTitle);
            } else {
                req.flash('err', 'Item does not exist!');
                res.redirect('/dashboard');
            }
        });
    } else {
        req.flash('err', 'Please log in to continue.');
        res.redirect('/login');
    }
});

module.exports = router;
