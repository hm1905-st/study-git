import React from 'react';
import { Home, RotateCcw, Trophy, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Result: React.FC = () => {
  const {
    numbers,
    userAnswers,
    score,
    gridSize,
    difficulty,
    resetGame,
    startNewGame
  } = useGameStore();

  const handleBackToHome = () => {
    resetGame();
  };

  const handlePlayAgain = () => {
    if (difficulty) {
      startNewGame(difficulty);
    }
  };

  // 计算正确和错误的数量
  const getStats = () => {
    let correct = 0;
    let total = 0;
    
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers[i].length; j++) {
        total++;
        if (parseInt(userAnswers[i][j]) === numbers[i][j]) {
          correct++;
        }
      }
    }
    
    return { correct, total, wrong: total - correct };
  };

  const stats = getStats();

  // 获取成绩等级
  const getGradeInfo = () => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100', message: '完美表现！' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100', message: '优秀！' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100', message: '良好！' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100', message: '及格！' };
    return { grade: 'D', color: 'text-red-600', bgColor: 'bg-red-100', message: '需要更多练习！' };
  };

  const gradeInfo = getGradeInfo();

  // 计算圆形进度条
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部导航 */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>返回主页</span>
          </button>
          
          <button
            onClick={handlePlayAgain}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>再玩一次</span>
          </button>
        </div>

        {/* 成绩展示 */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">游戏结果</h1>
            
            <div className="flex items-center justify-center space-x-8 mt-6">
              {/* 圆形进度条 */}
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{score}%</div>
                    <div className="text-sm text-gray-500">正确率</div>
                  </div>
                </div>
              </div>
              
              {/* 等级信息 */}
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-full ${gradeInfo.bgColor} mb-2`}>
                  <span className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                </div>
                <div className={`text-xl font-semibold ${gradeInfo.color}`}>{gradeInfo.message}</div>
              </div>
            </div>
            
            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-600">总题数</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                <div className="text-sm text-gray-600">答对</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-red-600 font-bold">✗</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.wrong}</div>
                <div className="text-sm text-gray-600">答错</div>
              </div>
            </div>
          </div>
        </div>

        {/* 答案对比 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">答案对比</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* 正确答案 */}
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-4 text-center">正确答案</h3>
              <div 
                className="grid gap-2 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  maxWidth: `${Math.min(300, gridSize * 60)}px`
                }}
              >
                {numbers.map((row, rowIndex) =>
                  row.map((number, colIndex) => (
                    <div 
                      key={`correct-${rowIndex}-${colIndex}`}
                      className="w-12 h-12 md:w-14 md:h-14 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-sm md:text-base font-bold text-green-800">
                        {number}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* 你的答案 */}
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-4 text-center">你的答案</h3>
              <div 
                className="grid gap-2 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  maxWidth: `${Math.min(300, gridSize * 60)}px`
                }}
              >
                {userAnswers.map((row, rowIndex) =>
                  row.map((answer, colIndex) => {
                    const isCorrect = parseInt(answer) === numbers[rowIndex][colIndex];
                    const isEmpty = !answer;
                    
                    return (
                      <div 
                        key={`user-${rowIndex}-${colIndex}`}
                        className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg flex items-center justify-center ${
                          isEmpty 
                            ? 'bg-gray-50 border-gray-200'
                            : isCorrect 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <span className={`text-sm md:text-base font-bold ${
                          isEmpty 
                            ? 'text-gray-400'
                            : isCorrect 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>
                          {answer || '?'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;