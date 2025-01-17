import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/userRoutes.js";
const app=express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use('/api/users',routes);
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`application is running on port ${PORT}`);
});