import pinecone from "../config/pinecone/index.js";
import elasticClient from "../config/elastic/index.js";
import { processText } from "../utils/utils.js";

export const addData = async (req, res) => {
    const { data } = req.body;
    console.log("Data: ", data);

    const { cleanedText, embeddings } = await processText(data);
    console.log("Cleaned Text: ", cleanedText);
    console.log("Embeddings: ", embeddings);

    try {
        const response = await elasticClient.index({
            index: 'quickstart',
            document: {
                text: cleanedText,
            }
        });
        console.log("Elastic Response: ", response);

        const index = pinecone.index('my-index');
        const upsertData = [{
            id: Date.now().toString(),
            values: embeddings,
            metadata: {
                text: cleanedText
            }
        }];

        console.log("Upsert Data: ", upsertData);

        const upsertResponse = await index.namespace('ns1').upsert(upsertData);
        console.log("Pinecone Response: ", upsertResponse);

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

