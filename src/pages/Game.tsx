import React, { useEffect, useRef } from 'react';
import { Clock, Home, CheckCircle, XCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Game: React.FC = () => {
  const {
    gamePhase,
    gridSize,
    numbers,
    userAnswers,
    timeLeft,
    difficulty,
    setTimeLeft,
    setGamePhase,
    setUserAnswer,
    calculateScore,
    resetGame
  } = useGameStore();

  // 根据难度获取总时间
  const getTotalTime = () => {
    switch (difficulty) {
      case 'easy': return 30;
      case 'medium': return 60;
      case 'hard': return 90;
      default: return 30;
    }
  };

  const totalTime = getTotalTime();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    if (gamePhase === 'memorizing' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gamePhase === 'memorizing' && timeLeft === 0) {
      setGamePhase('answering');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gamePhase, timeLeft, setTimeLeft, setGamePhase]);

  const handleInputChange = (row: number, col: number, value: string) => {
    // 只允许输入数字，最多2位
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2);
    setUserAnswer(row, col, numericValue);
  };

  const handleComplete = () => {
    calculateScore();
    setGamePhase('result');
  };

  const handleGiveUp = () => {
    calculateScore();
    setGamePhase('result');
  };

  const handleBackToHome = () => {
    resetGame();
  };

  // 计算进度条颜色
  const getProgressColor = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 60) return 'text-green-500';
    if (percentage > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressStroke = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 60) return 'stroke-green-500';
    if (percentage > 30) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部导航 */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>返回主页</span>
          </button>
          
          {gamePhase === 'memorizing' && (
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className={getProgressStroke()}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getProgressColor()}`}>
                      {timeLeft}
                    </div>
                    <div className="text-xs text-gray-500">秒</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm text-gray-600">记忆时间</div>
              </div>
            </div>
          )}
        </div>

        {/* 游戏状态提示 */}
        <div className="text-center mb-8">
          {gamePhase === 'memorizing' && (
            <div className="bg-blue-100 border border-blue-300 text-blue-800 px-6 py-3 rounded-lg">
              <h2 className="text-xl font-semibold mb-1">记忆阶段</h2>
              <p>仔细观察并记住每个数字的位置，时间结束后数字将被隐藏</p>
            </div>
          )}
          {gamePhase === 'answering' && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-lg">
              <h2 className="text-xl font-semibold mb-1">答题阶段</h2>
              <p>在相应的位置输入你记住的两位数数字</p>
            </div>
          )}
        </div>

        {/* 游戏网格 */}
        <div className="flex justify-center mb-8">
          <div 
            className="grid gap-2 p-6 bg-white rounded-xl shadow-lg"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              maxWidth: `${Math.min(600, gridSize * 80)}px`
            }}
          >
            {numbers.map((row, rowIndex) =>
              row.map((number, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="relative">
                  {gamePhase === 'memorizing' ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
                      <span className="text-lg md:text-xl font-bold text-blue-800">
                        {number}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={userAnswers[rowIndex][colIndex]}
                      onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                      className="w-16 h-16 md:w-20 md:h-20 border-2 border-gray-300 rounded-lg text-center text-lg md:text-xl font-bold focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="?"
                      maxLength={2}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 控制按钮 */}
        {gamePhase === 'answering' && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleComplete}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              <span>完成答题</span>
            </button>
            <button
              onClick={handleGiveUp}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              <XCircle className="w-5 h-5" />
              <span>放弃游戏</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;