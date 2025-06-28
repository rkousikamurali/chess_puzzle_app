const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// app.use(cors({
//   origin : "https://chess-puzzle-app-rkousikamuralis-projects.vercel.app",
//   credentials: true
// }));
app.use(cors());
app.use(express.json());
// app.use(express.json());

// Import router directly
const puzzlesRoute = require("./routes/puzzles");

// Attach the router
app.use("/api/puzzles", puzzlesRoute);

// ✅ Start server immediately (no preload needed)
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
