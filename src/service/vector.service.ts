// import { qdrantClient } from "../config/qdrant";
// import config from "../config/config";
// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
// import { v4 as uuidv4 } from "uuid";

// let embeddings: GoogleGenerativeAIEmbeddings | null = null;

// const getEmbeddings = () => {
//   if (!embeddings) {
//     if (!config.GEMINI_API_KEY) {
//       throw new Error("GEMINI_API_KEY is not set in environment variables");
//     }
//     embeddings = new GoogleGenerativeAIEmbeddings({
//       apiKey: config.GEMINI_API_KEY,
//       modelName: "models/embedding-001",
//     });
//   }
//   return embeddings;
// };

// export const createCollection = async (
//   collectionName: string
// ) => {
//   try {
//     await qdrantClient.getCollection(collectionName);
//     console.log("Collection already exists");
//   } catch {
//     await qdrantClient.createCollection(collectionName, {
//       vectors: {
//         size: config.EMBEDDING_DIMENSION,
//         distance: "Cosine",
//       },
//     });
//     console.log("Collection created");
//   }
// };

// export const generateEmbedding = async (text: string): Promise<number[]> => {
//   try {
//     const embedding = await getEmbeddings().embedQuery(text);
//     return embedding;
//   } catch (error) {
//     console.error("Error generating embedding:", error);
//     throw error;
//   }
// };

// export const storeVectors = async (
//   collectionName: string,
//   chunks: string[]
// ): Promise<string[]> => {
//   try {
//     const points = [];
//     const chunkIds: string[] = [];

//     for (const chunk of chunks) {
//       const embedding = await generateEmbedding(chunk);
//       const id = uuidv4();
//       chunkIds.push(id);

//       points.push({
//         id,
//         vector: embedding,
//         payload: {
//           text: chunk,
//           createdAt: new Date().toISOString(),
//         },
//       });
//     }

//     await qdrantClient.upsert(collectionName, {
//       points,
//     });

//     console.log(`Stored ${points.length} vectors in Qdrant`);
//     return chunkIds;
//   } catch (error) {
//     console.error("Error storing vectors:", error);
//     throw error;
//   }
// };

// export const searchSimilarChunks = async (
//   collectionName: string,
//   query: string,
//   topK: number = 5
// ): Promise<{ text: string; score: number }[]> => {
//   try {
//     const queryEmbedding = await generateEmbedding(query);

//     const results = await qdrantClient.search(collectionName, {
//       vector: queryEmbedding,
//       limit: topK,
//       with_payload: true,
//     });

//     return results.map((result) => ({
//       text: result.payload?.text as string,
//       score: result.score,
//     }));
//   } catch (error) {
//     console.error("Error searching similar chunks:", error);
//     throw error;
//   }
// };

import { qdrantClient } from "../config/qdrant";
import config from "../config/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { v4 as uuidv4 } from "uuid";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: config.GEMINI_API_KEY,
  modelName: "text-embedding-004",
});

const BATCH_SIZE = 50;

export const createCollection = async (
  collectionName: string
) => {
  try {
    await qdrantClient.getCollection(collectionName);

    console.log("Collection already exists");
  } catch {
    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: config.EMBEDDING_DIMENSION,
        distance: "Cosine",
      },
    });

    console.log("Collection Created");
  }
};

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  return await embeddings.embedQuery(text);
};

export const storeVectors = async (
  collectionName: string,
  chunks: string[]
): Promise<string[]> => {
  const ids: string[] = [];

  for (
    let i = 0;
    i < chunks.length;
    i += BATCH_SIZE
  ) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const points = [];

    for (const chunk of batch) {
      const embedding =
        await generateEmbedding(chunk);

      const id = uuidv4();

      ids.push(id);

      points.push({
        id,
        vector: embedding,
        payload: {
          text: chunk,
        },
      });
    }

    await qdrantClient.upsert(collectionName, {
      wait: true,
      points,
    });

    console.log(
      `Uploaded ${Math.min(
        i + BATCH_SIZE,
        chunks.length
      )}/${chunks.length}`
    );
  }

  return ids;
};

export const similaritySearch = async (
  collectionName: string,
  query: string,
  limit: number = 5
) => {
  const queryEmbedding =
    await generateEmbedding(query);

  const result =
    await qdrantClient.search(collectionName, {
      vector: queryEmbedding,
      limit,
      with_payload: true,
    });

  return result.map((item) => ({
    text: item.payload?.text,
    score: item.score,
  }));
};

export const deleteCollection = async (
  collectionName: string
) => {
  await qdrantClient.deleteCollection(
    collectionName
  );
};