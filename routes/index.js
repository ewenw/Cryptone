const express = require('express');
const router = express.Router();
const reddit = require('../bin/reddit.js');
const getrequest = require('../bin/getrequest.js');
const analyzer = require('../bin/analyzer.js');
const datetime = require('../bin/datetime.js');
const fs = require('fs');
let res;
let chartsData;
let redditData;
let analyzedData;


// subreddits to scrape
const SUBS = ['CryptoCurrency'];
// url of top crypto charts
const CHARTSURL = 'https://api.coinmarketcap.com/v1/ticker/';
const DATAFILE = 'topcoins.json';
const UPDATEINTERVAL = 500000;


router.get('/', (req, res, next) => {
  initialize((data) => {
    data.timeStamp = datetime.formatDate(data.timeStamp);
    res.render('index', data);
  });
});

router.get('/update', (req, res, next) => {
  initialize((data) => res.json(data));
});

router.get('/forceUpdate', (req, res, next) => {
    console.log("Updating data...");
    updateData().then((data) => {
      analyzeData(data);
      res.json(analyzedData);
    }, (err) => {console.log(err);});
});

const initialize = (cb) => {
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

const needsUpdate = (cb) => {
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

const updateData = () => {
  let requests = 0;
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

const analyzeData = (data, cb) => {
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
