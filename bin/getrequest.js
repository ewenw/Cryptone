const request = require('request');

module.exports = (url) => {
    return new Promise((resolve, reject) => {
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