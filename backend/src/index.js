import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { fileURLToPath } from "url";
import path from "path";
import { connectDB } from "./libs/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app,server} from "./libs/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);
app.use((req, res, next) => {
  console.log(`INCOMING REQUEST: ${req.method} ${req.originalUrl}`);
  next();
});


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


if(process.env.NODE_ENV==="production")
{
  app.use(express.static(path.join(__dirname,"../frontend/dist")));                     
   
  app.get("*",(req,res) => {
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
  })

}


connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
