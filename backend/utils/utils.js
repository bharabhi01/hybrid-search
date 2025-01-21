import * as tf from '@tensorflow/tfjs-node';

const cleanData = (data) => {
    // Common English stop words
    const stopWords = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'were', 'will', 'with'
    ]);

    // Remove punctuation, convert to lowercase, and normalize whitespace
    const removePunctuation = (text) => {
        return text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    // Remove stop words
    const removeStopWords = (text) => {
        return text.split(' ')
            .filter(word => !stopWords.has(word))
            .join(' ');
    };

    if (typeof data !== 'string') {
        return '';
    }

    // Apply cleaning steps in sequence
    const cleaned = removePunctuation(data);
    return removeStopWords(cleaned);
};

const processText = async (data) => {
    if (typeof data !== 'string') {
        return {
            cleanedText: '',
            embeddings: null
        };
    }

    const cleanedText = cleanData(data);

    try {
        // Create a pseudo-embedding using character-level features
        const words = cleanedText.split(' ');
        const embedding = new Array(1536).fill(0);

        words.forEach((word, wordIndex) => {
            // Generate features for each word
            const chars = word.split('');
            chars.forEach((char, charIndex) => {
                const code = char.charCodeAt(0);
                const position = (wordIndex * 100 + charIndex) % 1536;
                embedding[position] = (embedding[position] + code) / 2;
            });
        });

        // Normalize the embedding
        const sum = embedding.reduce((a, b) => a + b, 0);
        const normalizedEmbedding = embedding.map(x => x / (sum || 1));

        return {
            cleanedText,
            embeddings: normalizedEmbedding // 1536-dimensional vector
        };
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
};


const generateEmbedding = async (data) => {
    if (typeof data !== 'string') {
        return {
            embeddings: null
        };
    }

    try {
        // Clean the input data first
        const cleanedQuery = cleanData(data);
        const words = cleanedQuery.split(' ');
        const embedding = new Array(1536).fill(0);

        // Modified embedding generation to put more emphasis on exact word matches
        words.forEach((word, wordIndex) => {
            // Hash the entire word to create a more unique signature
            const wordHash = word.split('').reduce((acc, char) => {
                return acc + char.charCodeAt(0);
            }, 0);

            // Create distinct regions in the embedding for each word
            const regionSize = Math.floor(1536 / words.length);
            const startPos = (wordIndex * regionSize) % 1536;

            // Fill the region with the word's signature
            for (let i = 0; i < regionSize && (startPos + i) < 1536; i++) {
                embedding[startPos + i] = wordHash / (i + 1);
            }
        });

        // Normalize the embedding with L2 normalization
        const squareSum = embedding.reduce((acc, val) => acc + val * val, 0);
        const magnitude = Math.sqrt(squareSum);
        const normalizedEmbedding = embedding.map(x => x / (magnitude || 1));

        return {
            embeddings: normalizedEmbedding
        };
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
}

export {
    cleanData,
    processText,
    generateEmbedding
}