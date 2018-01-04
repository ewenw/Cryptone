var exports = {};
exports.getTimeStamp = () => {
        return Date.now();
};
exports.formatDate = (timeStamp) => {
        var date = new Date(timeStamp);
        return date.toString();
    };
exports.hasExpired = (timeStamp, millis) => {
        var now = Date.now();
        var elapsed = now - timeStamp;
        if (elapsed > millis) {
            console.log("Timestamp: " + timeStamp +
                " has expired by " + elapsed + " ms");
            return true;
        }
        return false;
    };
    
module.exports = exports;