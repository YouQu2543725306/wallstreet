'use strict';
var request = require('request');

// Read API key from environment variable
const apiKey = process.env.ALPHA_VANTAGE_KEY;

// Check if API key exists
if (!apiKey) {
  console.error('Error: ALPHA_VANTAGE_KEY is not set in environment variables.');
  process.exit(1);
}

const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&apikey=${apiKey}`;

request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
});
