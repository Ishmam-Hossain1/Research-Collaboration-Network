import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let gfsBucket;

export const initGridFS = () => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not initialized");
  }

  gfsBucket = new GridFSBucket(db, {
    bucketName: "profilePictures",
  });

  console.log("GridFS initialized");
};

export const getGridFSBucket = () => {
  if (!gfsBucket) {
    throw new Error("GridFSBucket is not initialized");
  }

  return gfsBucket;
};