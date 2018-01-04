exports.getTimeStamp = () => {
        return Date.now();
};
exports.formatDate = (timeStamp) => {
        const date = new Date(timeStamp);
        return date.toString();
    };
exports.hasExpired = (timeStamp, millis) => {
        const now = Date.now();
        const elapsed = now - timeStamp;
        if (elapsed > millis) {
            console.log("Timestamp: " + timeStamp +
                " has expired by " + elapsed + " ms");
            return true;
        }
        return false;
    };

module.exports = exports;