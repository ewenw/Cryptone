const request = require('request');
const getrequest = require('../bin/getrequest.js');

const URLHOST = 'https://www.reddit.com/r/'
const URLROUTE = '/hot.json?limit=';

// max number of posts to retrieve
const NUMPOSTS = 500;
// minimum score of post / commment to be included
const SCOREMIN = 3;

module.exports = (urls) => {
    let responses = [];
    let requestsLeft = urls.length;

    urls = urls.map((sub) => URLHOST + sub + URLROUTE + NUMPOSTS);
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

const getTopPosts = (data) => {
    let posts = data.data.children;
    console.log("Extracting " + posts.length + " posts...");
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            const topPosts = {
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
                    console.log(err);
                    reject(err);
                });
            });
        }
    });
};

const extractComments = (url) => {
    let comments = [];

    return new Promise((resolve, reject) => {
        getrequest(url + '.json?').then((response) => {
            console.log("Extracting comments from ", url);
            // append initial post
            if (response[0].data) {
                const initialPost = response[0].data.children[0];
                comments.push({
                    comment: initialPost.data.body,
                    score: initialPost.data.score
                });
            }

            // append comments
            if (response[1].data) {
                response[1].data.children.forEach((item) => {
                    const comment = item.data.body;
                    const score = item.data.score;
                    if (score >= SCOREMIN) {
                        comments.push({
                            comment: comment,
                            score: score
                        });
                    }
                });
            }
            console.log("");
            resolve(comments);
        }, (err) => {
            console.log(err);
            reject(err);
        });
    });
};

const applyFilters = (post) => {
    return post.data.distinguished !== 'moderator' &&
        post.data.title.toLowerCase().indexOf('daily') == -1 &&
        post.data.title.toLowerCase().indexOf('welcome') == -1 &&
        post.data.title.toLowerCase().indexOf('faq') == -1 &&
        post.data.url.indexOf('comments') > -1;
};
