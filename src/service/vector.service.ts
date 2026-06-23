import { qdrantClient } from "../config/qdrant";

export const createCollection = async (
  collectionName: string
) => {
  try {
    await qdrantClient.getCollection(
      collectionName
    );

    console.log(
      "Collection already exists"
    );
  } catch {
    await qdrantClient.createCollection(
      collectionName,
      {
        vectors: {
          size: 768, // embedding dimension
          distance: "Cosine",
        },
      }
    );

    console.log(
      "Collection created"
    );
  }
};