import { create } from 'zustand';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameState {
  difficulty: Difficulty | null;
  gridSize: number;
  numbers: number[][];
  userAnswers: string[][];
  gamePhase: 'home' | 'memorizing' | 'answering' | 'result';
  timeLeft: number;
  score: number;
  totalCells: number;
}

export interface GameActions {
  setDifficulty: (difficulty: Difficulty) => void;
  generateNumbers: () => void;
  setUserAnswer: (row: number, col: number, value: string) => void;
  setGamePhase: (phase: GameState['gamePhase']) => void;
  setTimeLeft: (time: number) => void;
  calculateScore: () => void;
  resetGame: () => void;
  startNewGame: (difficulty: Difficulty) => void;
}

type GameStore = GameState & GameActions;

const getDifficultyGridSize = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy': return 3;
    case 'medium': return 5;
    case 'hard': return 7;
    default: return 3;
  }
};

const getDifficultyTime = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy': return 30;
    case 'medium': return 60;
    case 'hard': return 90;
    default: return 30;
  }
};

const generateRandomNumbers = (size: number): number[][] => {
  const numbers: number[][] = [];
  const usedNumbers = new Set<number>();
  
  for (let i = 0; i < size; i++) {
    numbers[i] = [];
    for (let j = 0; j < size; j++) {
      let randomNum;
      do {
        randomNum = Math.floor(Math.random() * 90) + 10; // 10-99的两位数
      } while (usedNumbers.has(randomNum));
      
      usedNumbers.add(randomNum);
      numbers[i][j] = randomNum;
    }
  }
  
  return numbers;
};

const createEmptyAnswers = (size: number): string[][] => {
  return Array(size).fill(null).map(() => Array(size).fill(''));
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  difficulty: null,
  gridSize: 3,
  numbers: [],
  userAnswers: [],
  gamePhase: 'home',
  timeLeft: 30,
  score: 0,
  totalCells: 0,

  // Actions
  setDifficulty: (difficulty) => {
    const gridSize = getDifficultyGridSize(difficulty);
    set({ 
      difficulty, 
      gridSize,
      totalCells: gridSize * gridSize
    });
  },

  generateNumbers: () => {
    const { gridSize } = get();
    const numbers = generateRandomNumbers(gridSize);
    const userAnswers = createEmptyAnswers(gridSize);
    set({ numbers, userAnswers });
  },

  setUserAnswer: (row, col, value) => {
    const { userAnswers } = get();
    const newAnswers = [...userAnswers];
    newAnswers[row][col] = value;
    set({ userAnswers: newAnswers });
  },

  setGamePhase: (gamePhase) => set({ gamePhase }),

  setTimeLeft: (timeLeft) => set({ timeLeft }),

  calculateScore: () => {
    const { numbers, userAnswers, totalCells } = get();
    let correctCount = 0;
    
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers[i].length; j++) {
        if (parseInt(userAnswers[i][j]) === numbers[i][j]) {
          correctCount++;
        }
      }
    }
    
    const score = Math.round((correctCount / totalCells) * 100);
    set({ score });
  },

  resetGame: () => {
    set({
      difficulty: null,
      gridSize: 3,
      numbers: [],
      userAnswers: [],
      gamePhase: 'home',
      timeLeft: 30,
      score: 0,
      totalCells: 0
    });
  },

  startNewGame: (difficulty) => {
    const gridSize = getDifficultyGridSize(difficulty);
    const timeLeft = getDifficultyTime(difficulty);
    const numbers = generateRandomNumbers(gridSize);
    const userAnswers = createEmptyAnswers(gridSize);
    
    set({
      difficulty,
      gridSize,
      numbers,
      userAnswers,
      gamePhase: 'memorizing',
      timeLeft,
      score: 0,
      totalCells: gridSize * gridSize
    });
  }
}));