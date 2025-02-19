import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables.");
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Already connected to MongoDB");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      tls: true, // Ensure secure connection
      serverSelectionTimeoutMS: 5000, // Prevent long delays if connection fails
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);

    if (error.name === "MongoNetworkError") {
      console.error(
        "🚨 Network issue: Check your internet, MongoDB URI, or allow access to your IP in MongoDB Atlas."
      );
    }

    throw error;
  }
};
