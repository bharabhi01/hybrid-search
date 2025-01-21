const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');

dotenv.config();

const elasticClient = new Client({
    node: process.env.ELASTIC_SEARCH_NODE,
    auth: {
        apiKey: {
            id: process.env.ELASTIC_API_KEY_ID,
            api_key: process.env.ELASTIC_API_KEY
        }
    }
})

module.exports = elasticClient;