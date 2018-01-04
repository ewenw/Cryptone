const sentimentAnalysis = require('sentiment-analysis');

module.exports = (chartsData, redditData) => {
    // console.log(JSON.stringify(chartsData));
    let tempData = [];
    console.log("Analyzing data...");
    chartsData.forEach((coinData) => {
        coinData.mentions = getMentions(coinData, redditData);
        if (coinData.mentions > 0)
            tempData.push(coinData);
        // console.log(coinData.name + " has " + coinData.mentions + " mentions recently.");
    });
    chartsData = tempData;
    chartsData.sort((a, b) => {
        return b.mentions - a.mentions;
    });
    return chartsData;
};

const getMentions = (coinData, redditData) => {
    let mentions = 0;
    for (var subreddit of redditData) {
        for (var post of subreddit.posts) {
            for (var commentPair of post) {
                mentions += analyzeComment(coinData, commentPair);
            }
        }
    }

    return mentions;
};

const analyzeComment = (coinData, commentPair) => {
    if (commentPair.comment) {
        let score = 0;
        const commentToLower = commentPair.comment.toLowerCase();
        const symbol = coinData.symbol.toLowerCase();
        const name = coinData.id;
        const wordArray = commentToLower.split(' ');
        loop:
        for (var wordRaw of wordArray) {
            const word = wordRaw.replace(/[^a-zA-Z ]/g, "");
            if (word != 'etc' && (word === symbol || word === name)) {
                score += Math.log(commentPair.score);
                break loop;
            }
        }
        score *= analyzeSentiment(commentToLower);
        return Math.round(score);
    }
    return 0;
};

const analyzeSentiment = (comment) => {
    const sentiment = sentimentAnalysis(comment) * 10;
    // console.log(comment + " | " + sentiment);
    return sentiment;
};
