// backend/packages/order-db/src/connection.ts
import mongoose from "mongoose";

let isConnected = false;

export const connectOrderDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not defined in env file!");
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    isConnected = true;
    console.log(
      "[Mongo] Connected to MongoDB, db name:",
      mongoose.connection.name
    );
  } catch (error) {
    console.log("[Mongo] Connection error:", error);
    throw error;
  }
};
