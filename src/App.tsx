import React from 'react';
import { useGameStore } from './store/gameStore';
import Home from './pages/Home';
import Game from './pages/Game';
import Result from './pages/Result';

function App() {
  const { gamePhase } = useGameStore();

  const renderCurrentPage = () => {
    switch (gamePhase) {
      case 'home':
        return <Home />;
      case 'memorizing':
      case 'answering':
        return <Game />;
      case 'result':
        return <Result />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
