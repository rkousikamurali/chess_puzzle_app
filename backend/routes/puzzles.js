const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const router = express.Router();

// 📍 Path to SQLite DB
const DB_PATH = path.join(__dirname, "../lichess_puzzles.db");
const db = new Database(DB_PATH, { readonly: true });

// 🔁 GET /api/puzzles/random — fast DB-backed route
router.get("/random", (req, res) => {
  console.log("📥 GET /api/puzzles/random from DB");

  try {
    const row = db.prepare("SELECT * FROM puzzles ORDER BY RANDOM() LIMIT 1;").get();

    if (!row) {
      return res.status(404).json({ success: false, message: "No puzzle found" });
    }

    const moves = (row.moves || "").trim().split(" ");
    if (moves.length < 2) {
      return res.status(400).json({ success: false, message: "Puzzle has too few moves" });
    }

    const response = {
      success: true,
      id: row.id,
      initialFen: row.fen,
      initialMove: moves[0],         // to be applied on frontend
      solution: moves.slice(1),      // rest of the moves
      rating: row.rating,
      popularity: row.popularity,
      themes: row.themes?.split(",") || [],
      gameUrl: row.gameUrl,
      openingTags: row.openingTags || null,
    };

    console.log("✅ Puzzle served:", response.id, response.initialMove,response.solution);
    res.json(response);
  } catch (err) {
    console.error("❌ DB query failed:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
