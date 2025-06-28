// 📁 frontend/src/App.tsx
// 
import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import "./App.css";
// 
// Feature flags
const ENABLE_HIGHLIGHT_OPPONENT_MOVE = true;
const ENABLE_HINT_FEATURE = true;
// 
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
// 
type SquareStyle = {
  [square: string]: { backgroundColor: string };
};
// 
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
// 
  const loadPuzzle = async () => {
    // const res = await axios.get("http://192.168.0.109:3001/api/puzzles/random");
    const res = await axios.get("https://deep-flowers-watch.loca.lt/api/puzzles/random");
    // const res = await axios.get("https://02b9-49-205-84-206.ngrok-free.app/api/puzzles/random");
    // const res = await axios.get("https://loosely-immense-quail.ngrok-free.app/api/puzzles/random");
    const data: Puzzle = res.data;
    const newGame = new Chess();
    newGame.load(data.initialFen);
    newGame.move({ from: data.initialMove.slice(0, 2), to: data.initialMove.slice(2, 4) });
// 
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
// 
    if (ENABLE_HIGHLIGHT_OPPONENT_MOVE) {
      highlightMove(data.initialMove);
    } else {
      setHighlightedSquares({});
    }
  };
// 
  const highlightMove = (uciMove: string) => {
    const from = uciMove.slice(0, 2);
    const to = uciMove.slice(2, 4);
    setHighlightedSquares({
      [from]: { backgroundColor: "#f8f18c" },
      [to]: { backgroundColor: "#f8f18c" },
    });
  };
// 
  const onPieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (!puzzle || solved) return false;
// 
    const attemptedMove = `${sourceSquare}${targetSquare}`;
    const expectedMove = puzzle.solution[currentMoveIndex];
// 
    if (attemptedMove === expectedMove) {
      game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      setPosition(game.fen());
      setFeedback("Correct move! Please continue!!");
// 
      const nextMove = puzzle.solution[currentMoveIndex + 1];
      if (nextMove) {
        game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4), promotion: "q" });
        setPosition(game.fen());
        highlightMove(nextMove);
      }
// 
      const finalIndex = currentMoveIndex + 2;
      setCurrentMoveIndex(finalIndex);
      setHintState(0);
      setHintDisabled(false);
// 
      if (!puzzle.solution[finalIndex]) {
        setSolved(true);
        setFeedback("Puzzle completed! Please click Next Puzzle!!");
// 
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
// 
    return true;
  };
// 
  const handleHint = () => {
    if (!puzzle || hintDisabled || solved) return;
    const currentUserMove = puzzle.solution[currentMoveIndex];
    if (!currentUserMove) return;
// 
    setUsedHintThisPuzzle(true);
    const from = currentUserMove.slice(0, 2);
    // const to = currentUserMove.slice(2, 4);
// 
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
// 
  useEffect(() => {
    loadPuzzle();
  }, []);
// 
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
                <strong>Themes:</strong> {puzzle.themes[0].split(" ").join(", ")}
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
// 
export default App;





//////////////////////////////////////////////////////////////////////////////////////






// import  React, { useEffect, useState } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";
// import axios from "axios";
// import { Play, Lightbulb, RotateCcw, Trophy } from "lucide-react";
// 
// const ENABLE_HIGHLIGHT_OPPONENT_MOVE = true;
// const ENABLE_HINT_FEATURE = true;
// 
// type Puzzle = {
  // success: boolean;
  // id: string;
  // initialFen: string;
  // initialMove: string;
  // solution: string[];
  // rating: number;
  // themes: string[];
  // gameUrl?: string;
  // openingTags?: string | null;
// };
// 
// type SquareStyle = {
  // [square: string]: { backgroundColor: string };
// };
// 
// const App: React.FC = () => {
  // const [game, setGame] = useState<Chess>(new Chess());
  // const [position, setPosition] = useState<string>("start");
  // const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  // const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  // const [hintState, setHintState] = useState<number>(0);
  // const [highlightedSquares, setHighlightedSquares] = useState<SquareStyle>({});
  // const [hintDisabled, setHintDisabled] = useState<boolean>(false);
  // const [solved, setSolved] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string>("");
  // const [score, setScore] = useState<{ correct: number; incorrect: number; hintUsed: number }>({
    // correct: 0,
    // incorrect: 0,
    // hintUsed: 0,
  // });
  // const [wrongAttempted, setWrongAttempted] = useState<boolean>(false);
  // const [usedHintThisPuzzle, setUsedHintThisPuzzle] = useState<boolean>(false);
  // const [feedback, setFeedback] = useState<string>("");
// 
  // const loadPuzzle = async () => {
    // setLoading(true);
    // setError("");
    // try {
      // const res = await axios.get("https://few-steaks-know.loca.lt/api/puzzles/random");
      // const data: Puzzle = res.data;
      // const newGame = new Chess();
      // newGame.load(data.initialFen);
      // newGame.move({ from: data.initialMove.slice(0, 2), to: data.initialMove.slice(2, 4) });
// 
      // setGame(newGame);
      // setPuzzle(data);
      // setPosition(newGame.fen());
      // setCurrentMoveIndex(0);
      // setHintState(0);
      // setHintDisabled(false);
      // setSolved(false);
      // setWrongAttempted(false);
      // setUsedHintThisPuzzle(false);
      // setFeedback("");
// 
      // if (ENABLE_HIGHLIGHT_OPPONENT_MOVE) {
        // highlightMove(data.initialMove);
      // } else {
        // setHighlightedSquares({});
      // }
    // } catch (err) {
      // setError("Failed to load puzzle. Please check your backend connection.");
      // console.error("Error loading puzzle:", err);
    // } finally {
      // setLoading(false);
    // }
  // };
// 
  //  const highlightMove = (uciMove: string) => {
    // const from = uciMove.slice(0, 2);
    // const to = uciMove.slice(2, 4);
    // setHighlightedSquares({
      // [from]: { backgroundColor: "#f59e0b" },
      // [to]: { backgroundColor: "#f59e0b" },
    // });
  // }; 
// 
  // const onPieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    // if (!puzzle || solved) return false;
// 
    // const attemptedMove = `${sourceSquare}${targetSquare}`;
    // const expectedMove = puzzle.solution[currentMoveIndex];
// 
    // if (attemptedMove === expectedMove) {
      // game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      // setPosition(game.fen());
      // setFeedback("Correct move! Continue...");
// 
      // const nextMove = puzzle.solution[currentMoveIndex + 1];
      // if (nextMove) {
        // game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2, 4), promotion: "q" });
        // setPosition(game.fen());
        // highlightMove(nextMove);
      // }
// 
      // const finalIndex = currentMoveIndex + 2;
      // setCurrentMoveIndex(finalIndex);
      // setHintState(0);
      // setHintDisabled(false);
// 
      // if (!puzzle.solution[finalIndex]) {
        // setSolved(true);
        // setFeedback("Puzzle solved! Well done!");
// 
        // if (wrongAttempted) {
          // setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
        // } else if (usedHintThisPuzzle) {
          // setScore((prev) => ({ ...prev, hintUsed: prev.hintUsed + 1 }));
        // } else {
          // setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        // }
      // }
    // } else {
      // setFeedback("Incorrect move. Try again!");
      // if (!wrongAttempted) {
        // setWrongAttempted(true);
      // }
      // const tempGame = new Chess(game.fen());
      // setGame(tempGame);
      // setPosition(tempGame.fen());
    // }
// 
    // return true;
  // };
// 
  // const handleHint = () => {
    // if (!puzzle || hintDisabled || solved) return;
    // const currentUserMove = puzzle.solution[currentMoveIndex];
    // if (!currentUserMove) return;
// 
    // setUsedHintThisPuzzle(true);
    // const from = currentUserMove.slice(0, 2);
// 
      //  if (hintState === 0) {
      // setHighlightedSquares({
        // [from]: { backgroundColor: "#3b82f6" },
      // });
      // setHintState(1); 
    // } else if (hintState === 1) {
      // highlightMove(currentUserMove);
      // setHintDisabled(true);
      // setHintState(2);
    // }
  // };
// 
  // useEffect(() => {
    // loadPuzzle();
  // }, []);
// 
  // return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* <div className="max-w-4xl mx-auto"> */}
        {/* <div className="text-center mb-8"> */}
          {/* <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3"> */}
            {/* <span className="text-5xl">♟</span> */}
            {/* Chess Puzzle Trainer */}
          {/* </h1> */}
          {/* <p className="text-slate-600">Improve your tactical skills with interactive puzzles</p> */}
        {/* </div> */}
{/*  */}
        {/* <div className="grid lg:grid-cols-3 gap-8"> */}
          {/* <div className="lg:col-span-2"> */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6"> */}
              {/* {loading ? ( */}
                // <div className="flex items-center justify-center h-80">
                  {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div> */}
                {/* </div> */}
              // ) : error ? (
                // <div className="flex flex-col items-center justify-center h-80 text-center">
                  {/* <p className="text-red-600 mb-4">{error}</p> */}
                  {/* <button */}
                    // onClick={loadPuzzle}
                    // className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  // >
                    {/* <RotateCcw className="w-4 h-4 inline mr-2" /> */}
                    {/* Retry */}
                  {/* </button> */}
                {/* </div> */}
              // ) : (
                // <div className="flex justify-center">
                  {/* <Chessboard */}
                    // position={position}
                    // onPieceDrop={onPieceDrop}
                    // boardWidth={Math.min(500, window.innerWidth - 100)}
                    // boardOrientation={puzzle?.initialFen.split(" ")[1] === "w" ? "black" : "white"}
                    // customSquareStyles={highlightedSquares}
                  // />
                {/* </div> */}
              // )}
            {/* </div> */}
          {/* </div> */}
{/*  */}
          {/* <div className="space-y-6"> */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6"> */}
              {/* <div className="flex gap-3 mb-6"> */}
                {/* <button */}
                  // onClick={loadPuzzle}
                  // disabled={loading}
                  // className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                // >
                  {/* <Play className="w-4 h-4" /> */}
                  {/* Next Puzzle */}
                {/* </button> */}
                {/* {ENABLE_HINT_FEATURE && ( */}
                  // <button
                    // onClick={handleHint}
                    // disabled={hintDisabled || loading}
                    // className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  // >
                    {/* <Lightbulb className="w-4 h-4" /> */}
                    {/* Hint */}
                  {/* </button> */}
                // )}
              {/* </div> */}
{/*  */}
              {/* <div className="space-y-4"> */}
                {/* <div className="flex items-center justify-between"> */}
                  {/* <span className="text-sm font-medium text-slate-600">Turn:</span> */}
                  {/* <span className="text-sm font-bold text-slate-800"> */}
                    {/* {game.turn() === "w" ? "White" : "Black"} */}
                  {/* </span> */}
                {/* </div> */}
{/*  */}
                {/* {feedback && ( */}
                  // <div className={`p-3 rounded-lg text-sm font-medium ${
                    // feedback.includes("Correct") || feedback.includes("solved") 
                      // ? "bg-green-100 text-green-800" 
                      // : "bg-red-100 text-red-800"
                  // }`}>
                    {/* {feedback} */}
                  {/* </div> */}
                // )}
{/*  */}
                {/* {solved && puzzle && ( */}
                  // <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    {/* <div className="flex items-center justify-between"> */}
                      {/* <span className="text-sm font-medium text-slate-600">Rating:</span> */}
                      {/* <span className="text-sm font-bold text-slate-800">{puzzle.rating}</span> */}
                    {/* </div> */}
                    {/* <div> */}
                      {/* <span className="text-sm font-medium text-slate-600">Themes:</span> */}
                      {/* <p className="text-sm text-slate-800 mt-1">{puzzle.themes[0]}</p> */}
                    {/* </div> */}
                  {/* </div> */}
                // )}
              {/* </div> */}
            {/* </div> */}
{/*  */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6"> */}
              {/* <div className="flex items-center gap-2 mb-4"> */}
                {/* <Trophy className="w-5 h-5 text-amber-500" /> */}
                {/* <h3 className="font-bold text-slate-800">Score</h3> */}
              {/* </div> */}
              {/* <div className="grid grid-cols-3 gap-4 text-center"> */}
                {/* <div className="bg-green-50 p-3 rounded-lg"> */}
                  {/* <div className="text-2xl font-bold text-green-600">{score.correct}</div> */}
                  {/* <div className="text-xs text-green-600">Correct</div> */}
                {/* </div> */}
                {/* <div className="bg-red-50 p-3 rounded-lg"> */}
                  {/* <div className="text-2xl font-bold text-red-600">{score.incorrect}</div> */}
                  {/* <div className="text-xs text-red-600">Incorrect</div> */}
                {/* </div> */}
                {/* <div className="bg-amber-50 p-3 rounded-lg"> */}
                  {/* <div className="text-2xl font-bold text-amber-600">{score.hintUsed}</div> */}
                  {/* <div className="text-xs text-amber-600">Hints</div> */}
                {/* </div> */}
              {/* </div> */}
            {/* </div> */}
          {/* </div> */}
        {/* </div> */}
      {/* </div> */}
    {/* </div> */}
  // );
// };
// 
// export default App;
//  
// 