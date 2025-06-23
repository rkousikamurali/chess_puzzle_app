// PuzzleInteraction.tsx
// import React, { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";

export default function PuzzleInteraction() {
  const [chess, setChess] = useState(new Chess());
  const [solution, setSolution] = useState<string[]>([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [puzzleId, setPuzzleId] = useState<string>("");
  const [status, setStatus] = useState<string>("Loading puzzle...");
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [hasTriedIncorrect, setHasTriedIncorrect] = useState(false);

  const loadPuzzle = async () => {
    try {
      setStatus("Loading puzzle...");
      const res = await axios.get("http://localhost:3001/api/puzzles/random");
      const { initialFen, initialMove, solution, id } = res.data;
      const game = new Chess(initialFen);
      game.move({ from: initialMove.slice(0, 2), to: initialMove.slice(2, 4) });
      setChess(game);
      setSolution(solution);
      setMoveIndex(0);
      setPuzzleId(id);
      setCurrentTurn(game.turn());
      setHasTriedIncorrect(false);
      setStatus("Your move!");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load puzzle");
    }
  };

  useEffect(() => {
    loadPuzzle();
  }, []);

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    const userMove = sourceSquare + targetSquare;

    if (userMove === solution[moveIndex]) {
      const newGame = new Chess(chess.fen());
      newGame.move({ from: sourceSquare, to: targetSquare });
      const nextMove = solution[moveIndex + 1];
      if (nextMove) {
        newGame.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4) });
        setMoveIndex(moveIndex + 2);
      } else {
        setMoveIndex(moveIndex + 1);
        setStatus("✅ Puzzle solved!");
        setScore({ ...score, correct: score.correct + 1 });
      }
      setChess(newGame);
      setCurrentTurn(newGame.turn());
      setHasTriedIncorrect(false);
      return true;
    } else {
      setStatus("❌ Incorrect move. Try again.");
      if (!hasTriedIncorrect) {
        setScore({ ...score, incorrect: score.incorrect + 1 });
        setHasTriedIncorrect(true);
      }
      return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1">Puzzle ID: {puzzleId}</h2>
        <p className="text-sm text-gray-700 italic">{status}</p>
        <p className="text-md font-medium mt-1">
          {currentTurn === "w" ? "♔ White to move" : "♚ Black to move"}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          ✅ Correct: {score.correct} &nbsp; ❌ Incorrect: {score.incorrect}
        </p>
  
        <div className="mt-4 flex justify-center">
          <Chessboard
            position={chess.fen()}
            onPieceDrop={onDrop}
            boardWidth={400}
            boardOrientation={currentTurn === "w" ? "white" : "black"}
          />
        </div>
  
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadPuzzle}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            🔁 Next Puzzle
          </button>
        </div>
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";
// import axios from "axios";

// export default function PuzzleInteraction() {
//   const [chess, setChess] = useState(new Chess());
//   const [solution, setSolution] = useState<string[]>([]);
//   const [moveIndex, setMoveIndex] = useState(0);
//   const [puzzleId, setPuzzleId] = useState<string>("");
//   const [status, setStatus] = useState<string>("Loading puzzle...");
//   const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
//   const [score, setScore] = useState({ correct: 0, incorrect: 0 });

//   const loadPuzzle = async () => {
//     try {
//       setStatus("Loading puzzle...");
//       const res = await axios.get("http://localhost:3001/api/puzzles/random");
//       const { initialFen, initialMove, solution, id } = res.data;
//       const game = new Chess(initialFen);
//       game.move({ from: initialMove.slice(0, 2), to: initialMove.slice(2, 4) });
//       setChess(game);
//       setSolution(solution);
//       setMoveIndex(0);
//       setPuzzleId(id);
//       setCurrentTurn(game.turn());
//       setStatus("Your move!");
//     } catch (err) {
//       console.error(err);
//       setStatus("Failed to load puzzle");
//     }
//   };

//   useEffect(() => {
//     loadPuzzle();
//   }, []);

//   const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
//     const userMove = sourceSquare + targetSquare;

//     if (userMove === solution[moveIndex]) {
//       const newGame = new Chess(chess.fen());
//       newGame.move({ from: sourceSquare, to: targetSquare });
//       const nextMove = solution[moveIndex + 1];
//       if (nextMove) {
//         newGame.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4) });
//         setMoveIndex(moveIndex + 2);
//       } else {
//         setMoveIndex(moveIndex + 1);
//         setStatus("✅ Puzzle solved!");
//         setScore({ ...score, correct: score.correct + 1 });
//       }
//       setChess(newGame);
//       setCurrentTurn(newGame.turn());
//       return true;
//     } else {
//       setStatus("❌ Incorrect move. Try again.");
//       setScore({ ...score, incorrect: score.incorrect + 1 });
//       return false;
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 text-center">
//       <div className="mb-4">
//         <h2 className="text-xl font-semibold mb-1">Puzzle ID: {puzzleId}</h2>
//         <p className="text-sm text-gray-700 italic">{status}</p>
//         <p className="text-md font-medium mt-1">
//           {currentTurn === "w" ? "♔ White to move" : "♚ Black to move"}
//         </p>
//         <p className="text-xs text-gray-600 mt-2">
//           ✅ Correct: {score.correct} &nbsp; ❌ Incorrect: {score.incorrect}
//         </p>
//       </div>

//       <Chessboard
//         position={chess.fen()}
//         onPieceDrop={onDrop}
//         boardWidth={400}
//         boardOrientation={currentTurn === "w" ? "white" : "black"}
//         // showLegalMoves={true}
//       />

//       <div className="mt-6 flex gap-4 flex-wrap justify-center">
//         <button
//           onClick={loadPuzzle}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           🔁 Next Puzzle
//         </button>
//       </div>
//     </div>
//   );
// }
