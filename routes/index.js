var express = require('express');
var router = express.Router();
var reddit = require('../bin/reddit.js');
var res;
var subs = ['Ripple', 'RequestNetwork', 'waltonchain', 'helloicon', 'IOTA', 'Lisk', 'omise_go', 'Stellar'];
/* GET home page. */
router.get('/', function(req, res, next) {
  this.res = res;
  reddit(subs, displayPosts);
});

var displayPosts = function(subs) {
  this.res.render('index', {subs:subs});
};

module.exports = router;
