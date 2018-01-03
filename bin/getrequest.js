var request = require('request');

module.exports = function (url) {
    return new Promise(function (resolve, reject) {
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
                resolve(data);
            }
        });
    });

};