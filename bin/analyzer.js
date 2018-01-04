module.exports = (chartsData, redditData) => {
    // console.log(JSON.stringify(chartsData));
    var tempData = [];
    chartsData.forEach((coinData) => {
        coinData.mentions = getMentions(coinData, redditData);
        if(coinData.mentions > 0)
            tempData.push(coinData);
        // console.log(coinData.name + " has " + coinData.mentions + " mentions recently.");
    });
    chartsData = tempData;
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
                        if (word != 'etc' && (word === symbol || word === name)) {
                            mentions += Math.round(Math.log(commentPair.score));
                            break loop;
                        }
                    }
                }
            }
        }
    }

    return mentions;
};
