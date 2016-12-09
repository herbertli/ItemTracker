var mongoose = require('mongoose');
var URLSlugs = require('mongoose-url-slugs');
var passportLocalMongoose = require('passport-local-mongoose');

var User = mongoose.Schema({
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location'}]
});
User.plugin(passportLocalMongoose);

var Item = mongoose.Schema({
    title: {type: String, required: true, validate: {
        validator: function (v) {
            return /[\w\s]+/.test(v);
        }
    }},
    description: String,
    quantity: {type: Number, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});
Item.plugin(URLSlugs('title'));

var Location = mongoose.Schema({
    title: {type: String, required: true, validate: {
        validator: function (v) {
            return /[\w\s]+/.test(v);
        }
    }},
    description: String,
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});
Location.plugin(URLSlugs('title'));

mongoose.model('User', User);
mongoose.model('Location', Location);
mongoose.model('Item', Item);

// is the environment variable, NODE_ENV, set to PRODUCTION?
if (process.env.NODE_ENV == 'PRODUCTION') {
    // if we're in PRODUCTION mode, then read the configration from a file
    // use blocking file io to do this...
    var fs = require('fs');
    var path = require('path');
    var fn = path.join(__dirname, 'config.json');
    var data = fs.readFileSync(fn);

    // our configuration file will be in json, so parse it and set the
    // connection string appropriately!
    var conf = JSON.parse(data);
    var dbconf = conf.dbconf;
} else {
    // if we're not in PRODUCTION mode, then use
    dbconf = 'mongodb://localhost/itemtracker';
}

mongoose.connect(dbconf);