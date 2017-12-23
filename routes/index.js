var express = require('express');
var router = express.Router();
var reddit = require('../bin/reddit.js');
var res;
/* GET home page. */
router.get('/', function(req, res, next) {
  this.res = res;
  reddit('https://www.reddit.com/r/ripple/hot.json?limit=3', displayPosts);
  
});

var displayPosts = function(topPosts) {
  this.res.render('index', {topPosts:topPosts});
};

module.exports = router;
