import pinecone from "../config/pinecone/index.js";
import elasticClient from "../config/elastic/index.js";
import { processText, generateEmbedding } from "../utils/utils.js";

export const addData = async (req, res) => {
    const { data } = req.body;

    const { cleanedText, embeddings } = await processText(data);

    try {
        const response = await elasticClient.index({
            index: 'quickstart',
            document: {
                text: cleanedText,
            }
        });

        const index = pinecone.index('my-index');
        const upsertData = [{
            id: Date.now().toString(),
            values: embeddings,
            metadata: {
                text: cleanedText
            }
        }];

        const upsertResponse = await index.namespace('ns1').upsert(upsertData);

        res.status(200).json({
            message: "Data added successfully",
        });
    } catch (error) {
        console.error("Error adding data: ", error);
        res.status(500).json({
            message: "Error adding data",
            error: error.message,
        });
    }
};


export const searchData = async (req, res) => {
    const { query } = req.body;

    const ELASTIC_WEIGHT = 0.4;
    const VECTOR_WEIGHT = 0.6;

    try {
        const { embeddings } = await generateEmbedding(query);

        const elasticResponse = await elasticClient.search({
            index: 'quickstart',
            body: {
                query: {
                    match: {
                        text: {
                            query: query,
                            operator: 'and'
                        }
                    }
                },
                _source: ["text"],
                size: 20
            }
        });

        const elasticResults = elasticResponse.hits.hits.map(hit => ({
            text: hit._source.text,
            elasticScore: hit._score / Math.max(...elasticResponse.hits.hits.map(h => h._score)), // Normalize to 0-1
            pineconeScore: 0,
            source: 'elastic'
        }));

        const index = pinecone.index('my-index');
        const pineconeResponse = await index.namespace('ns1').query({
            vector: embeddings,
            topK: 10,
            includeMetadata: true,
        });

        const pineconeResults = pineconeResponse.matches
            .filter(match => match.score > 0.6)
            .map(match => ({
                text: match.metadata.text,
                elasticScore: 0,
                pineconeScore: match.score,
                source: 'pinecone'
            }));

        const allResults = [...elasticResults, ...pineconeResults];

        const uniqueResults = Array.from(
            allResults.reduce((map, item) => {
                const existingItem = map.get(item.text);
                if (!existingItem ||
                    (existingItem.elasticScore + existingItem.pineconeScore <
                        item.elasticScore + item.pineconeScore)) {
                    map.set(item.text, {
                        ...item,
                        // If same text appears in both sources, use the max scores
                        elasticScore: Math.max(item.elasticScore, map.get(item.text)?.elasticScore || 0),
                        pineconeScore: Math.max(item.pineconeScore, map.get(item.text)?.pineconeScore || 0)
                    });
                }
                return map;
            }, new Map())
                .values()
        );

        const rankedResults = uniqueResults
            .map(result => ({
                ...result,
                combinedScore: (result.elasticScore * ELASTIC_WEIGHT) +
                    (result.pineconeScore * VECTOR_WEIGHT)
            }))
            .sort((a, b) => b.combinedScore - a.combinedScore)
            .slice(0, 10);


        res.status(200).json({
            message: "Data searched successfully",
            results: rankedResults
        });
    } catch (error) {
        console.error("Error searching data: ", error);
        res.status(500).json({
            message: "Error searching data",
            error: error.message,
        });
    }
}