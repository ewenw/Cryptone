const json2csv = require('json2csv');
const fs = require('fs');
const fields = [''];
const file = 'log.csv';
const newLine = '\r\n\r\n\r\n';
const separator = '--------------------';

module.exports = (data) => {
    try {
        let result;
        data.data.time = data.timeStamp;
        fs.stat('log.csv', function (err, stat) {
            if (!err) {
                /*fs.appendFile('log.csv', json2csv({
                    data: [{ id: separator }],
                    hasCSVColumnTitle: false
                }));*/
                result = json2csv({
                    data: data.data,
                    hasCSVColumnTitle: false
                });
                fs.appendFile('log.csv', newLine + result);
                console.log('Data saved to ', file);
            }
            else {
                result = json2csv({
                    data: data.data
                });
                fs.appendFile('log.csv', result);
                console.log('Data saved to ', file);
            }
        });


    } catch (err) {
        console.error(err);
    }


};