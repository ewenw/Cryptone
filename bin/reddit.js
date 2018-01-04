var request = require('request');
var getrequest = require('../bin/getrequest.js');

var urlHost = 'https://www.reddit.com/r/'
var urlRoute = '/hot.json?limit=';
var numPosts = 500;
var scoreMinimum = 3;

module.exports = function (urls) {
    var responses = [];
    var requestsLeft = urls.length;

    urls = urls.map((sub) => urlHost + sub + urlRoute + numPosts);
    return new Promise((resolve, reject) => {
        urls.forEach((url) => {
            request.get({
                url: url,
                json: true,
                headers: { 'User-Agent': 'request' }
            }, (err, res, data) => {
                if (err) {
                    reject(err);
                } else if (res.statusCode !== 200) {
                    reject(res.statusCode);
                } else {
                    getTopPosts(data).then((data) => {
                        requestsLeft--;

                        responses.push(data);
                        if (requestsLeft == 0) {
                            console.log("Finished extracting posts from ", url);
                            resolve(responses);
                        }
                    }, (err) => {
                        console.log("Error ", err);
                    });
                }

            });
        });
    });
};

var getTopPosts = function (data) {
    var posts = data.data.children;
    var topPosts;
    var title;

    return new Promise((resolve, reject) => {
        if (posts.length > 0) {

            topPosts = {
                title: posts[0].data.subreddit,
                posts: []
            };
            posts = posts.filter(applyFilters);
            var postsLeft = posts.length;
            posts.forEach((p) => {
                extractComments(p.data.url).then((data) => {
                    topPosts.posts.push(data);
                    postsLeft--;

                    if (postsLeft == 0) {
                        console.log("Finished extracting comments from top posts");
                        resolve(topPosts);
                    }
                }, (err) => {
                    reject(err);
                });
            });
        }
    });
};

var extractComments = function (url) {
    var comments = [];

    return new Promise((resolve, reject) => {
        getrequest(url + '.json?').then((response) => {
            //console.log("Extracting comments from ", url);
            // append initial post
            var initialPost = response[0].data.children[0];
            comments.push({
                comment: initialPost.data.body,
                score: initialPost.data.score
            });

            // append comments
            response[1].data.children.forEach((item) => {
                var comment = item.data.body;
                var score = item.data.score;
                if (score >= scoreMinimum) {
                    comments.push({
                        comment: comment,
                        score: score
                    });
                }
            });
            resolve(comments);
        }, (err) => {
            reject(err);
        });
    });
};

var applyFilters = function (post) {
    return post.data.distinguished !== 'moderator' &&
        post.data.title.toLowerCase().indexOf('daily') == -1 &&
        post.data.title.toLowerCase().indexOf('welcome') == -1 &&
        post.data.title.toLowerCase().indexOf('faq') == -1 &&
        post.data.url.indexOf('comments') > -1;
};
