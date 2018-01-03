module.exports = function (chartsData, redditData) {
    // console.log(JSON.stringify(chartsData));
    chartsData.forEach((coinData) => {
        coinData.mentions = getMentions(coinData, redditData);
        // console.log(coinData.name + " has " + coinData.mentions + " mentions recently.");
    });
    chartsData.sort((a, b) => {
        return b.mentions - a.mentions;
    });
    return chartsData;
};

var getMentions = (coinData, redditData) => {
    var mentions = 0;
    for (var subreddit of redditData) {
        for (var post of subreddit.posts) {
            for (var commentPair of post) {
                if (commentPair.comment) {
                    var commentToLower = commentPair.comment.toLowerCase();
                    var symbol = coinData.symbol.toLowerCase();
                    var name = coinData.id;
                    var wordArray = commentToLower.split(' ');
                    loop:
                    for (var wordRaw of wordArray) {
                        var word = wordRaw.replace(/[^a-zA-Z ]/g, "");
                        if (word === symbol || word === name) {
                            mentions += commentPair.score;
                            break loop;
                        }
                    }
                }
            }
        }
    }

    return mentions;
};
