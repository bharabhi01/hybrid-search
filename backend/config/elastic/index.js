const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');

dotenv.config();

const elasticClient = new Client({
    node: process.env.ELASTIC_SEARCH_NODE,
    auth: {
        apiKey: process.env.ELASTIC_SEARCH_API_KEY
    }
})

module.exports = elasticClient;