import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let gfsBucket;
let datasetsBucket;

export const initGridFS = () => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not initialized");
  }

  gfsBucket = new GridFSBucket(db, {
    bucketName: "profilePictures",
  });

  datasetsBucket = new GridFSBucket(db, {
    bucketName: "datasets",
  });

  console.log("GridFS initialized (profilePictures + datasets)");
};

export const getGridFSBucket = () => {
  if (!gfsBucket) {
    throw new Error("GridFSBucket is not initialized");
  }
  return gfsBucket;
};

export const getDatasetsBucket = () => {
  if (!datasetsBucket) {
    throw new Error("Datasets GridFSBucket is not initialized");
  }
  return datasetsBucket;
};