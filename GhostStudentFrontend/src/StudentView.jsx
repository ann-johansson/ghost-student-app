import React, { useState, useEffect, useRef } from 'react';
import { FiVideo, FiMic, FiShare, FiMessageSquare, FiXCircle } from 'react-icons/fi';


const StudentView = () => {
  const [focusScore, setFocusScore] = useState(100);
  const [isDistracted, setIsDistracted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [timeDistracted, setTimeDistracted] = useState(0);

  const distractionInterval = useRef(null);
  const quizTimeout = useRef(null);
  const popQuizTimeout = useRef(null);
  const distractionTimer = useRef(null);

  // Tab Tracking & Distraction Timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsDistracted(true);
        distractionInterval.current = setInterval(() => {
          setFocusScore(prevScore => Math.max(0, prevScore - 1));
        }, 1000);
        distractionTimer.current = setInterval(() => {
          setTimeDistracted(prevTime => prevTime + 1);
        }, 1000);
      } else {
        setIsDistracted(false);
        clearInterval(distractionInterval.current);
        clearInterval(distractionTimer.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(distractionInterval.current);
      clearInterval(distractionTimer.current);
    };
  }, []);

  // Pop Quiz Logic
  useEffect(() => {
    const schedulePopQuiz = () => {
      const randomInterval = Math.random() * (15 * 60 * 1000 - 10 * 60 * 1000) + 10 * 60 * 1000; // 10-15 min
      
      quizTimeout.current = setTimeout(() => {
        setShowQuiz(true);
        popQuizTimeout.current = setTimeout(() => {
          handleQuizMiss();
        }, 8000); // 8 seconds to click
      }, randomInterval);
    };

    schedulePopQuiz();

    return () => {
      clearTimeout(quizTimeout.current);
      clearTimeout(popQuizTimeout.current);
    };
  }, []); 

  const handleQuizClick = () => {
    clearTimeout(popQuizTimeout.current);
    setShowQuiz(false);
    setFocusScore(prevScore => Math.min(100, prevScore + 10)); 
  };

  const handleQuizMiss = () => {
    setShowQuiz(false);
    setFocusScore(prevScore => Math.max(0, prevScore - 20));
  };

  const getScoreColor = (score) => {
    if (score > 80) return 'text-green-400';
    if (score < 50) return 'text-red-500';
    return 'text-yellow-400';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const FocusRing = ({ score }) => {
    const radius = 80;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="-rotate-90 transform"
        >
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={getScoreColor(score).replace('text-', '').replace('-400', '').replace('-500', '')}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`transition-all duration-300 ease-in-out`}
          />
        </svg>
        <p className={`absolute text-5xl font-bold ${getScoreColor(score)}`}>{score}</p>
      </div>
    );
  };


  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8">
        <header className="mb-2 text-center">
          <h1 className="text-3xl font-bold text-white mb-0">GhostStudent</h1>
          <p className="text-gray-400 -mt-1">dont lose track</p>
        </header>
        
        <div className="flex-1 bg-black/50 rounded-lg overflow-hidden relative shadow-2xl border-2 border-gray-700 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
             <p className="text-gray-400 text-2xl">Video Feed Offline</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 mt-4">
            <button className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"><FiMic size={20} /></button>
            <button className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"><FiVideo size={20} /></button>
            <button className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"><FiShare size={20} /></button>
            <button className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"><FiMessageSquare size={20} /></button>
            <button className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"><FiXCircle size={24} /></button>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-80 bg-gray-800/50 p-6 flex flex-col shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">Dashboard</h2>
        <div className="flex flex-col items-center space-y-6">
          <h3 className="text-lg font-semibold text-gray-300">Focus Score</h3>
          <FocusRing score={focusScore} />
          {isDistracted && <p className="text-yellow-400 animate-pulse mt-2">You seem distracted!</p>}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-sm space-y-4">
            <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`font-bold ${isDistracted ? 'text-yellow-400' : 'text-green-400'}`}>
                    {isDistracted ? 'Distracted' : 'Focused'}
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Time Distracted:</span>
                <span className="font-bold text-white">{formatTime(timeDistracted)}</span>
            </div>
        </div>
      </aside>

      {/* Pop Quiz Modal */}
      {showQuiz && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold text-white mb-4">Pop Quiz!</h2>
            <p className="text-gray-300 mb-6">Click the button to prove you're paying attention!</p>
            <button 
              onClick={handleQuizClick}
              className="text-6xl animate-bounce p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-lg transform hover:scale-110 transition-transform"
            >
              🎯
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;

