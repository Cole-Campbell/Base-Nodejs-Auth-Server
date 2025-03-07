import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { UserRoutes } from "./src/controllers/UserController.js";
import { AuthRoutes } from "./src/controllers/AuthController.js";

// Ensure you create an .env file or utilize your own secrets manager
const { parsed: { URI, PORT } } = dotenv.config({path: "./.env.local"})
const app = express();
const port = PORT || 5000;

// Replace DB Name you are looking to connect to
mongoose.connect(URI, { dbName: "recipes" });

const database = mongoose.connection;

database.on("error", (error) => console.log(error));

database.once("connected", () => console.log("Connected"));

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Welcome to your server" });
});

app.use("/api/users", UserRoutes);
app.use("/api/auth", AuthRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
