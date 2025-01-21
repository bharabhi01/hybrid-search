import express from "express";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import elasticClient from "./config/elastic/index.js";
import pinecone from "./config/pinecone/index.js";

// Load environment variables first
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use("/", routes);

export default app;