const fs = require("fs");
const path = require("path");
const sqlite3 = require("better-sqlite3");
const csvParser = require("csv-parser");

const DB_PATH = path.join(__dirname, "lichess_puzzles.db");
const CSV_PATH = path.join(__dirname, "data", "puzzles.csv"); // adjust if needed

const db = sqlite3(DB_PATH);

// Drop old table (optional)
db.prepare(`DROP TABLE IF EXISTS puzzles`).run();

db.prepare(`
  CREATE TABLE puzzles (
    id TEXT PRIMARY KEY,
    fen TEXT,
    moves TEXT,
    rating INTEGER,
    ratingDeviation INTEGER,
    popularity INTEGER,
    nbPlays INTEGER,
    themes TEXT,
    gameUrl TEXT,
    openingTags TEXT
  )
`).run();

const insertStmt = db.prepare(`
  INSERT INTO puzzles (id, fen, moves, rating, ratingDeviation, popularity, nbPlays, themes, gameUrl, openingTags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let count = 0;
const BATCH_SIZE = 10000;
let batch = [];

console.log("📥 Reading CSV and loading into database...");

fs.createReadStream(CSV_PATH)
  .pipe(csvParser())
  .on("data", (row) => {
    batch.push([
      row.PuzzleId,
      row.FEN,
      row.Moves,
      parseInt(row.Rating),
      parseInt(row.RatingDeviation),
      parseInt(row.Popularity),
      parseInt(row.NbPlays),
      row.Themes,
      row.GameUrl,
      row.OpeningTags
    ]);

    if (batch.length >= BATCH_SIZE) {
      const tx = db.transaction(() => {
        for (const entry of batch) {
          insertStmt.run(entry);
        }
      });
      tx();
      count += batch.length;
      console.log(`✅ Inserted ${count} rows...`);
      batch = [];
    }
  })
  .on("end", () => {
    if (batch.length > 0) {
      const tx = db.transaction(() => {
        for (const entry of batch) {
          insertStmt.run(entry);
        }
      });
      tx();
      count += batch.length;
    }

    console.log(`🎉 Done! Total puzzles inserted: ${count}`);
    db.close();
  });
