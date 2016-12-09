var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');

var Item = mongoose.model('Item');
var Location = mongoose.model('Location');
var User = mongoose.model('User');

/**
 * Add location
 */
router.post('/addLocation', function (req, res) {
    if (req.user) {
        if (!req.body.locationTitle) {
            res.status(400).json({error: 'Please specify a title for your location.'});
        } else {
            Location.findOne({user: req.user._id, title: req.body.locationTitle}, function (err, location) {
                if (err) {
                    res.status(500).json({error: 'Something bad happened on our end. Maybe try again.'});
                } else if (location) {
                    res.status(400).json({error: 'This location already exists.'})
                } else {
                    var newLocation = new Location({
                        user: req.user._id,
                        title: req.body.locationTitle,
                        description: req.body.locationDesc
                    });
                    newLocation.save(function (err, savedLocation) {
                        if (err) {
                            res.status(500).json({error: 'Please only use alphanumeric characters and spaces in your title.'});
                        } else if (savedLocation) {
                            req.user.locations.push(savedLocation._id);
                            req.user.save(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                res.json(savedLocation);
                            });
                        } else {
                            res.status(500).json({error: 'Something bad happened on our end. Maybe try again.'});
                        }
                    });
                }
            });
        }
    } else {
        res.status(400).json({error: 'You are logged out. Please log in to continue.'});
    }
});

/**
 * Get users locations and items
 */
router.get('/getData', function (req, res) {
    if (req.user) {
        User.findOne({username: req.user.username}).populate({
            path: 'locations',
            populate: {
                path: 'items',
                model: 'Item'
            }
        }).exec(function (err, user) {
            if (err) {
                res.status(500).json({error: 'Something bad happened on our end. Maybe try again.'});
            } else {
                res.json(user);
            }
        });
    } else {
        res.status(400).json({error: 'You are logged out. Please log in to continue.'});
    }
});

/**
 * Add item to location
 */
router.post('/location/:title/addItem', function (req, res) {
    if (req.user) {
        Location.findOne({
            title: req.params.title,
            user: req.user._id
        }, function (err, location) {
            if (err) {
                res.status(500).json({error: 'Something bad happened on our end. Maybe try again.'});
            } else if (location) {
                if (!req.body.itemTitle) {
                    res.status(400).json({error: 'Please specify a title for your item.'});
                } else if (!req.body.itemQuantity) {
                    res.status(400).json({error: 'Please specify a quantity for your item.'});
                } else {
                    new Item({
                        title: req.body.itemTitle,
                        user: req.user._id,
                        description: req.body.itemDesc,
                        quantity: req.body.itemQuantity
                    }).save(function (err, newItem) {
                        if (err) {
                            res.status(500).json({error: 'Please only use alphanumeric characters and spaces in your title'});
                        } else if (newItem) {
                            location.items.push(newItem);
                            location.save(function (err) {
                                if (err) {
                                    res.status(500).json({error: 'Something bad happened on our end. Maybe try again.'});
                                }
                                User.findOne({username: req.user.username}).populate('locations').exec(function (err, user) {
                                    if (err) {
                                        res.status(500).json({error: 'Something bad happened on our end. Maybe try again.'});
                                    }
                                    res.json({newItem: newItem, locations: user.locations});
                                });
                            });
                        } else {
                            res.status(500).json({error: 'Something bad happened on our end. Maybe try again.'});
                        }
                    });
                }
            } else {
                res.status(400).json({error: 'Location does not exist.'});
            }
        });
    } else {
        res.status(500).json({error: 'Please log in to continue.'});
    }
});

module.exports = router;
