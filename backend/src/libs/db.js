import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MONGODB CONNECTED : ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error", error);
  }
};

export default connectDB;