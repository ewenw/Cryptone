var request = require('request');

var urlHost = 'https://www.reddit.com/r/'
var urlLimit = '/hot.json?limit=5';

module.exports = function (urls, callback) {
    var responses = [];
    var completedRequests = 0;

    urls = urls.map((sub) => urlHost + sub + urlLimit);

    urls.forEach((url) => {
        request.get({
            url: url,
            json: true,
            headers: { 'User-Agent': 'request' }
        }, (err, res, data) => {
            if (err) {
                console.log('Error:', err);
            } else if (res.statusCode !== 200) {
                console.log('Status:', res.statusCode);
            } else {
                responses.push(getTopPosts(data));
            }
            completedRequests++;
            if (completedRequests == urls.length) {
                callback(responses);
            }
        });
    });
};

var getTopPosts = function (data) {
    var posts = data.data.children;
    var topPosts;

    if (posts.length > 0) {
        topPosts = {
            title: posts[0].data.subreddit,
            posts: []
        };
        posts = posts.filter(applyFilters);
        posts.forEach((p) => topPosts.posts.push({
            title: p.data.title,
            url: p.data.url
        }));
    }
    return topPosts;
};

var applyFilters = function (post) {
    return post.data.distinguished !== 'moderator' &&
        post.data.title.toLowerCase().indexOf('daily') == -1 &&
        post.data.title.toLowerCase().indexOf('welcome') == -1 &&
        post.data.title.toLowerCase().indexOf('faq') == -1;
};
