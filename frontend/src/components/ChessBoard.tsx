import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useState } from 'react';

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());

  const onDrop = (source: string, target: string) => {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return false;
    setGame(new Chess(game.fen()));
    return true;
  };

  return (
    <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={480} />
  );
};

export default ChessBoard;