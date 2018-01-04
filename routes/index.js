var express = require('express');
var router = express.Router();
var reddit = require('../bin/reddit.js');
var getrequest = require('../bin/getrequest.js');
var analyzer = require('../bin/analyzer.js');
var datetime = require('../bin/datetime.js');
var fs = require('fs');
var res;
var chartsData;
var redditData;
var analyzedData;


// subreddits to scrape
var SUBS = ['CryptoCurrency'];
// url of top crypto charts
var CHARTSURL = 'https://api.coinmarketcap.com/v1/ticker/';
var DATAFILE = 'topcoins.json';
var UPDATEINTERVAL = 500000;


router.get('/', (req, res, next) => {
  initialize((data)=>{
    res.render('index', data);
  });
});

router.get('/update', (req, res, next) => {
  initialize(res.json);
});

router.get('/forceUpdate', (req, res, next) => {
    console.log("Updating data...");
    updateData().then((data) => {
      analyzeData(data);
      res.json(analyzedData);
    });
});

var initialize = (cb) => {
  needsUpdate((result) => {
    if (result) {
    console.log("Updating data...");
    updateData().then((data) => {
      analyzeData(data);
      cb(analyzedData);
    },
      (err) => { throw err; });
  }
  else {
    console.log("Using existing data...");
    cb(analyzedData);
  }
  });
}

var needsUpdate = (cb) => {
  if (!analyzedData) {
    fs.readFile(DATAFILE, (err, data) => {
      if (err) {
        cb(true);
      }
      else {
        analyzedData = JSON.parse(data);
        cb(false);
      }
    });
  }
  else {
    cb(datetime.hasExpired(analyzedData.timeStamp, UPDATEINTERVAL));
  }
};

var updateData = () => {
  var requests = 0;
  return new Promise((resolve, reject) => {
    // update charts and subreddit data
    getrequest(CHARTSURL).then((response) => {
      chartsData = response;
      requests++;
      if (requests == 2) {
        resolve({
          timeStamp: datetime.getTimeStamp(),
          chartsData: chartsData,
          redditData: redditData
        });
      }
    }, (error) => {
      reject("Error retrieving top charts " + error);
    });

    reddit(SUBS).then((response) => {
      redditData = response;
      requests++;
      if (requests == 2) {
        resolve({
          timeStamp: datetime.getTimeStamp(),
          chartsData: chartsData,
          redditData: redditData
        });
      }
    }, (error) => {
      reject("Error retrieving reddit comments " + error);
    });
  });
};

var analyzeData = (data, cb) => {
  analyzedData = {
    timeStamp: data.timeStamp,
    data: analyzer(data.chartsData, data.redditData)
  };
  fs.writeFile(DATAFILE, JSON.stringify(analyzedData, null, 2), (err) => {
    if (err) throw err;
    console.log('Analyzed data saved to ' + DATAFILE);
  });
};

module.exports = router;
