// import PuzzleInteraction from "./components/PuzzleInteraction";

// export default function App() {
//   return (
//     <div>
//       <PuzzleInteraction />
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";
// import axios from "axios";
// import "./App.css";

// // Feature flags
// const ENABLE_HIGHLIGHT_OPPONENT_MOVE = true;
// const ENABLE_HINT_FEATURE = true;

// const App = () => {
//   const [game, setGame] = useState(new Chess());
//   const [position, setPosition] = useState("start");
//   const [puzzle, setPuzzle] = useState<any>(null);
//   const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
//   const [hintState, setHintState] = useState<number>(0); // 0: no hint, 1: start square, 2: full move
//   const [highlightedSquares, setHighlightedSquares] = useState<Record<string, any>>({});
//   const [hintDisabled, setHintDisabled] = useState<boolean>(false);

//   const loadPuzzle = async () => {
//     const res = await axios.get("http://localhost:3001/api/puzzles/random");
//     const data = res.data;
//     const newGame = new Chess();
//     newGame.load(data.initialFen);
//     newGame.move({ from: data.initialMove.slice(0, 2), to: data.initialMove.slice(2, 4) });

//     setGame(newGame);
//     setPuzzle(data);
//     setPosition(newGame.fen());
//     setCurrentMoveIndex(0);
//     setHintState(0);
//     setHintDisabled(false);

//     if (ENABLE_HIGHLIGHT_OPPONENT_MOVE) {
//       highlightMove(data.initialMove);
//     } else {
//       setHighlightedSquares({});
//     }
//   };

//   const highlightMove = (uciMove: string) => {
//     const from = uciMove.slice(0, 2);
//     const to = uciMove.slice(2, 4);
//     setHighlightedSquares({
//       [from]: { backgroundColor: "#f8f18c" },
//       [to]: { backgroundColor: "#f8f18c" },
//     });
//   };

//   const onPieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
//     const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

//     if (move === null) return false;
//     setPosition(game.fen());
//     setHighlightedSquares({});

//     if (
//       puzzle &&
//       puzzle.solution &&
//       puzzle.solution[currentMoveIndex] === `${sourceSquare}${targetSquare}`
//     ) {
//       // correct move
//       const nextMove = puzzle.solution[currentMoveIndex + 1];
//       setCurrentMoveIndex((prev) => prev + 2);

//       if (nextMove) {
//         game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4), promotion: "q" });
//         setPosition(game.fen());
//         highlightMove(nextMove);
//       }

//       setHintState(0);
//       setHintDisabled(false);
//     } else {
//       // wrong move logic (backend handles actual wrong count, this just doesn't proceed)
//     }

//     return true;
//   };

//   const handleHint = () => {
//     if (!puzzle || hintDisabled) return;
//     const currentUserMove = puzzle.solution[currentMoveIndex];
//     if (!currentUserMove) return;

//     const from = currentUserMove.slice(0, 2);
//     const to = currentUserMove.slice(2, 4);

//     if (hintState === 0) {
//       // Show start square
//       setHighlightedSquares({
//         [from]: { backgroundColor: "#aee5f8" },
//       });
//       setHintState(1);
//     } else if (hintState === 1) {
//       // Show full move and disable
//       highlightMove(currentUserMove);
//       setHintDisabled(true);
//       setHintState(2);
//     }
//   };

//   useEffect(() => {
//     loadPuzzle();
//   }, []);

//   return (
//     <div className="app">
//       <h1>♟️ Chess Puzzle Trainer</h1>
//       <div className="board-container">
//         <Chessboard
//           position={position}
//           onPieceDrop={onPieceDrop}
//           boardWidth={500}
//           boardOrientation={game.turn() === "w" ? "white" : "black"}
//           customSquareStyles={highlightedSquares}
//         />
//         <div className="controls">
//           <button onClick={loadPuzzle}>Next Puzzle</button>
//           {ENABLE_HINT_FEATURE && (
//             <button onClick={handleHint} disabled={hintDisabled}>
//               Hint
//             </button>
//           )}
//         </div>
//         {puzzle && (
//           <div className="info">
//             <p><strong>Move:</strong> {game.turn() === "w" ? "White" : "Black"}</p>
//             <p><strong>Rating:</strong> {puzzle.rating}</p>
//             <p><strong>Popularity:</strong> {puzzle.popularity}</p>
//             <p><strong>Themes:</strong> {puzzle.themes.join(", ")}</p>
//             <a href={puzzle.gameUrl} target="_blank" rel="noopener noreferrer">View Game</a>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default App;


//                                  ########################################################################### //

// import React, { useEffect, useState } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";
// import axios from "axios";
// import "./App.css";

// // Feature flags
// const ENABLE_HIGHLIGHT_OPPONENT_MOVE = true;
// const ENABLE_HINT_FEATURE = true;

// const App = () => {
//   const [game, setGame] = useState<Chess>(new Chess());
//   const [position, setPosition] = useState<string>("start");
//   const [puzzle, setPuzzle] = useState<any>(null);
//   const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
//   const [hintState, setHintState] = useState<number>(0); // 0: no hint, 1: start square, 2: full move
//   const [highlightedSquares, setHighlightedSquares] = useState<Record<string, any>>({});
//   const [hintDisabled, setHintDisabled] = useState<boolean>(false);
//   const [solved, setSolved] = useState<boolean>(false);
//   const [score, setScore] = useState<{ correct: number; incorrect: number; hintUsed: number }>({ correct: 0, incorrect: 0, hintUsed: 0 });
//   const [wrongAttemptedThisPuzzle, setWrongAttemptedThisPuzzle] = useState<boolean>(false);
//   const [hintUsedThisPuzzle, setHintUsedThisPuzzle] = useState<boolean>(false);
//   const [orientation, setOrientation] = useState<"white" | "black">("white");

//   const loadPuzzle = async () => {
//     const res = await axios.get("http://localhost:3001/api/puzzles/random");
//     const data = res.data;
//     const newGame = new Chess();
//     newGame.load(data.initialFen);
//     const initialFrom = data.initialMove.slice(0, 2);
//     const initialTo = data.initialMove.slice(2, 4);
//     const moveColor = newGame.get(initialFrom)?.color === "w" ? "white" : "black";
//     setOrientation(moveColor === "white" ? "black" : "white");
//     newGame.move({ from: initialFrom, to: initialTo });

//     setGame(newGame);
//     setPuzzle(data);
//     setPosition(newGame.fen());
//     setCurrentMoveIndex(0);
//     setHintState(0);
//     setHintDisabled(false);
//     setSolved(false);
//     setWrongAttemptedThisPuzzle(false);
//     setHintUsedThisPuzzle(false);

//     if (ENABLE_HIGHLIGHT_OPPONENT_MOVE) {
//       highlightMove(data.initialMove);
//     } else {
//       setHighlightedSquares({});
//     }
//   };

//   const highlightMove = (uciMove: string) => {
//     const from = uciMove.slice(0, 2);
//     const to = uciMove.slice(2, 4);
//     setHighlightedSquares({
//       [from]: { backgroundColor: "#f8f18c" },
//       [to]: { backgroundColor: "#f8f18c" },
//     });
//   };

//   const onPieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
//     const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
//     if (move === null) return false;

//     setPosition(game.fen());
//     setHighlightedSquares({});

//     if (
//       puzzle &&
//       puzzle.solution &&
//       puzzle.solution[currentMoveIndex] === `${sourceSquare}${targetSquare}`
//     ) {
//       const nextMove = puzzle.solution[currentMoveIndex + 1];
//       setCurrentMoveIndex((prev) => prev + 2);

//       if (nextMove) {
//         game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4), promotion: "q" });
//         setPosition(game.fen());
//         highlightMove(nextMove);
//       }

//       setHintState(0);
//       setHintDisabled(false);

//       if (!nextMove) {
//         setSolved(true);
//         if (!wrongAttemptedThisPuzzle && !hintUsedThisPuzzle) {
//           setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
//         }
//       }
//     } else {
//       if (!wrongAttemptedThisPuzzle) {
//         setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
//         setWrongAttemptedThisPuzzle(true);
//       }
//     }

//     return true;
//   };

//   const handleHint = () => {
//     if (!puzzle || hintDisabled) return;
//     const currentUserMove = puzzle.solution[currentMoveIndex];
//     if (!currentUserMove) return;

//     const from = currentUserMove.slice(0, 2);
//     const to = currentUserMove.slice(2, 4);

//     if (!hintUsedThisPuzzle) {
//       setScore((prev) => ({ ...prev, hintUsed: prev.hintUsed + 1 }));
//       setHintUsedThisPuzzle(true);
//     }

//     if (hintState === 0) {
//       setHighlightedSquares({
//         [from]: { backgroundColor: "#aee5f8" },
//       });
//       setHintState(1);
//     } else if (hintState === 1) {
//       highlightMove(currentUserMove);
//       setHintDisabled(true);
//       setHintState(2);
//     }
//   };

  
//   useEffect(() => {
//     loadPuzzle();
//   }, []);

//   return (
//     <div className="app">
//       <h1>♟ Chess Puzzle Trainer</h1>
//       <div className="board-container">
//         <Chessboard
//           position={position}
//           onPieceDrop={onPieceDrop}
//           boardWidth={500}
//           boardOrientation={orientation}
//           customSquareStyles={highlightedSquares}
//         />
//         <div className="controls">
//           <button onClick={loadPuzzle}>Next Puzzle</button>
//           {ENABLE_HINT_FEATURE && (
//             <button onClick={handleHint} disabled={hintDisabled}>
//               Hint
//             </button>
//           )}
//         </div>
//         <div className="info">
//           <p><strong>Move:</strong> {game.turn() === "w" ? "White" : "Black"}</p>
//           {solved && puzzle && (
//             <>
//               <p><strong>Rating:</strong> {puzzle.rating}</p>
//               <p><strong>Themes:</strong> {puzzle.themes.join(", ")}</p>
//             </>
//           )}
//         </div>
//         <div className="score">
//           <p><strong>Score:</strong> {score.correct} ✅ / {score.incorrect} ❌ / {score.hintUsed} 💡</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

// 📁 frontend/src/App.tsx

import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import "./App.css";

// Feature flags
const ENABLE_HIGHLIGHT_OPPONENT_MOVE = true;
const ENABLE_HINT_FEATURE = true;

type Puzzle = {
  success: boolean;
  id: string;
  initialFen: string;
  initialMove: string;
  solution: string[];
  rating: number;
  themes: string[];
  gameUrl?: string;
  openingTags?: string | null;
};

type SquareStyle = {
  [square: string]: { backgroundColor: string };
};

const App: React.FC = () => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [position, setPosition] = useState<string>("start");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [hintState, setHintState] = useState<number>(0);
  const [highlightedSquares, setHighlightedSquares] = useState<SquareStyle>({});
  const [hintDisabled, setHintDisabled] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(false);
  const [score, setScore] = useState<{ correct: number; incorrect: number; hintUsed: number }>({
    correct: 0,
    incorrect: 0,
    hintUsed: 0,
  });
  const [wrongAttempted, setWrongAttempted] = useState<boolean>(false);
  const [usedHintThisPuzzle, setUsedHintThisPuzzle] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  const loadPuzzle = async () => {
    // const res = await axios.get("http://localhost:3001/api/puzzles/random");
    const res = await axios.get("https://02b9-49-205-84-206.ngrok-free.app/api/puzzles/random");
    const data: Puzzle = res.data;
    const newGame = new Chess();
    newGame.load(data.initialFen);
    newGame.move({ from: data.initialMove.slice(0, 2), to: data.initialMove.slice(2, 4) });

    setGame(newGame);
    setPuzzle(data);
    setPosition(newGame.fen());
    setCurrentMoveIndex(0);
    setHintState(0);
    setHintDisabled(false);
    setSolved(false);
    setWrongAttempted(false);
    setUsedHintThisPuzzle(false);
    setFeedback("");

    if (ENABLE_HIGHLIGHT_OPPONENT_MOVE) {
      highlightMove(data.initialMove);
    } else {
      setHighlightedSquares({});
    }
  };

  const highlightMove = (uciMove: string) => {
    const from = uciMove.slice(0, 2);
    const to = uciMove.slice(2, 4);
    setHighlightedSquares({
      [from]: { backgroundColor: "#f8f18c" },
      [to]: { backgroundColor: "#f8f18c" },
    });
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (!puzzle || solved) return false;

    const attemptedMove = `${sourceSquare}${targetSquare}`;
    const expectedMove = puzzle.solution[currentMoveIndex];

    if (attemptedMove === expectedMove) {
      game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      setPosition(game.fen());
      setFeedback("Correct move! Please continue!!");

      const nextMove = puzzle.solution[currentMoveIndex + 1];
      if (nextMove) {
        game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4), promotion: "q" });
        setPosition(game.fen());
        highlightMove(nextMove);
      }

      const finalIndex = currentMoveIndex + 2;
      setCurrentMoveIndex(finalIndex);
      setHintState(0);
      setHintDisabled(false);

      if (!puzzle.solution[finalIndex]) {
        setSolved(true);
        setFeedback("Puzzle completed! Please click Next Puzzle!!");

        if (wrongAttempted) {
          setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
        } else if (usedHintThisPuzzle) {
          setScore((prev) => ({ ...prev, hintUsed: prev.hintUsed + 1 }));
        } else {
          setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        }
      }
    } else {
      setFeedback("Incorrect move! Please try again!!");
      if (!wrongAttempted) {
        setWrongAttempted(true);
      }
      // Revert move
      const tempGame = new Chess(game.fen());
      setGame(tempGame);
      setPosition(tempGame.fen());
    }

    return true;
  };

  const handleHint = () => {
    if (!puzzle || hintDisabled || solved) return;
    const currentUserMove = puzzle.solution[currentMoveIndex];
    if (!currentUserMove) return;

    setUsedHintThisPuzzle(true);
    const from = currentUserMove.slice(0, 2);
    // const to = currentUserMove.slice(2, 4);

    if (hintState === 0) {
      setHighlightedSquares({
        [from]: { backgroundColor: "#aee5f8" },
      });
      setHintState(1);
    } else if (hintState === 1) {
      highlightMove(currentUserMove);
      setHintDisabled(true);
      setHintState(2);
    }
  };

  useEffect(() => {
    loadPuzzle();
  }, []);

  return (
    <div className="app">
      <h1>♟ Chess Puzzle Trainer</h1>
      <div className="board-container">
        <Chessboard
          position={position}
          onPieceDrop={onPieceDrop}
          boardWidth={500}
          boardOrientation={puzzle?.initialFen.split(" ")[1] === "w" ? "black" : "white"}
          customSquareStyles={highlightedSquares}
        />
        <div className="controls">
          <button onClick={loadPuzzle}>Next Puzzle</button>
          {ENABLE_HINT_FEATURE && (
            <button onClick={handleHint} disabled={hintDisabled}>
              Hint
            </button>
          )}
        </div>
        <div className="info">
          <p>
            <strong>Move:</strong> {game.turn() === "w" ? "White" : "Black"}
          </p>
          <p>{feedback}</p>
          {solved && puzzle && (
            <>
              <p>
                <strong>Rating:</strong> {puzzle.rating}
              </p>
              <p>
                <strong>Themes:</strong> {puzzle.themes.join(", ")}
              </p>
            </>
          )}
        </div>
        <div className="score">
          <p>
            <strong>Score:</strong> ✅ {score.correct} / ❌ {score.incorrect} / 💡 {score.hintUsed}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;



