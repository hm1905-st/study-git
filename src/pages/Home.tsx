import React from 'react';
import { Brain, Grid3X3, Grid, Layers } from 'lucide-react';
import { useGameStore, Difficulty } from '../store/gameStore';

const Home: React.FC = () => {
  const { startNewGame } = useGameStore();

  const handleStartGame = (difficulty: Difficulty) => {
    startNewGame(difficulty);
  };

  const difficultyOptions = [
    {
      id: 'easy' as Difficulty,
      title: '简单模式',
      description: '3×3 网格',
      icon: Grid3X3,
      color: 'from-green-400 to-green-600',
      hoverColor: 'hover:from-green-500 hover:to-green-700'
    },
    {
      id: 'medium' as Difficulty,
      title: '中等模式',
      description: '5×5 网格',
      icon: Grid,
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700'
    },
    {
      id: 'hard' as Difficulty,
      title: '困难模式',
      description: '7×7 网格',
      icon: Layers,
      color: 'from-red-400 to-red-600',
      hoverColor: 'hover:from-red-500 hover:to-red-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-16 h-16 text-blue-600 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
              记忆力训练
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            通过数字记忆游戏锻炼你的短期记忆能力，选择适合的难度开始挑战！
          </p>
        </div>
        
        {/* 游戏介绍 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">游戏规则</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">观察记忆</h3>
              <p className="text-gray-600 text-sm">仔细观察网格中的两位数数字，你有30秒的记忆时间</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">输入答案</h3>
              <p className="text-gray-600 text-sm">数字隐藏后，在相应位置输入你记住的数字</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">查看结果</h3>
              <p className="text-gray-600 text-sm">完成后查看正确答案和你的得分</p>
            </div>
          </div>
        </div>
        
        {/* 难度选择 */}
        <div className="grid md:grid-cols-3 gap-6">
          {difficultyOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleStartGame(option.id)}
                className={`bg-gradient-to-br ${option.color} ${option.hoverColor} text-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-200 hover:shadow-xl`}
              >
                <div className="text-center">
                  <IconComponent className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
                  <p className="text-lg opacity-90">{option.description}</p>
                  <div className="mt-4 text-sm opacity-75">
                    点击开始游戏
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;