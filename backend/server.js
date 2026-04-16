const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from TaskFlow API");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));
