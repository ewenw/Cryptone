var request = require('request');

module.exports = function (url, callback) {
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
            callback(getTopPosts(data));
        }
    });
};

var getTopPosts = function (data) {
    var posts = data.data.children;
    var topPosts = [];
    posts = posts.filter(applyFilters);
    posts.forEach((p) => topPosts.push({
        title: p.data.title,
        url: p.data.url
    }));
    return topPosts;
};

var applyFilters = function (post) {
    return post.data.distinguished !== 'moderator' &&
        post.data.title.toLowerCase().indexOf('daily') == -1;
};
