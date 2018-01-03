var express = require('express');
var router = express.Router();
var reddit = require('../bin/reddit.js');
var getrequest = require('../bin/getrequest.js');
var analyzer = require('../bin/analyzer.js');
var res;
var chartsData;
var redditData;
var analyzedData;

// subreddits to scrape
var subs = ['CryptoCurrency'];
// url of top crypto charts
var chartsURL = 'https://api.coinmarketcap.com/v1/ticker/';

/* GET home page. */
router.get('/', (req, res, next) => {
  this.res = res;
  reddit(subs, displayPosts);
});

router.get('/update', (req, res, next) => {
  // update charts and subreddit data
  getrequest(chartsURL).then((response) => {
    chartsData = response;
  }, (error) => {
    console.log("Error retrieving top charts ", error);
  });

  reddit(subs).then((response) => {
    redditData = response;
    res.json({
      message: "Coins as of " + getDateTime(),
      data: redditData
    });
  }, (error) => {
    console.log("Error retrieving reddit comment ", error);
  });
});

router.get('/analyze', (req, res, next) => {
  if (!chartsData || !redditData){
    console.log("Please use /update to retrieve the most recent data first");
  }
  else{
    analyzedData = analyzer(chartsData, redditData);
    res.json(analyzedData);
  }
});

var displayPosts = function (subs) {
  this.res.render('index', { subs: subs });
};

function getDateTime() {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

module.exports = router;
