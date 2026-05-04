import React, { useState, useEffect, useRef } from 'react';

const StudentView = () => {
  const [focusScore, setFocusScore] = useState(100);
  const [isDistracted, setIsDistracted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const distractionInterval = useRef(null);
  const quizTimeout = useRef(null);
  const popQuizTimeout = useRef(null);

  // Tab Tracking Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsDistracted(true);
        distractionInterval.current = setInterval(() => {
          setFocusScore(prevScore => Math.max(0, prevScore - 1));
        }, 1000);
      } else {
        setIsDistracted(false);
        clearInterval(distractionInterval.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(distractionInterval.current);
    };
  }, []);

  // Pop Quiz Logic
  useEffect(() => {
    const schedulePopQuiz = () => {
      const randomInterval = Math.random() * (15 * 60 * 1000 - 10 * 60 * 1000) + 10 * 60 * 1000; // 10-15 minutes
      
      quizTimeout.current = setTimeout(() => {
        setShowQuiz(true);
        popQuizTimeout.current = setTimeout(() => {
          handleQuizMiss();
        }, 5000); // 5 seconds to click
      }, randomInterval);
    };

    schedulePopQuiz();

    return () => {
      clearTimeout(quizTimeout.current);
      clearTimeout(popQuizTimeout.current);
    };
  }, [focusScore]); // Reschedule if score changes, to keep it dynamic

  const handleQuizClick = () => {
    clearTimeout(popQuizTimeout.current);
    setShowQuiz(false);
    // Optional: reward for clicking
    // setFocusScore(prevScore => Math.min(100, prevScore + 5)); 
  };

  const handleQuizMiss = () => {
    setShowQuiz(false);
    setFocusScore(prevScore => Math.max(0, prevScore - 20));
  };

  const getScoreColor = () => {
    if (focusScore > 80) return 'text-green-500';
    if (focusScore < 50) return 'text-red-500';
    return 'text-white';
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">FocusCheck Session</h1>
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/placeholder"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Focus Score</h3>
          <p className={`text-7xl font-bold ${getScoreColor()}`}>{focusScore}</p>
          {isDistracted && <p className="text-yellow-400 mt-2">You are distracted!</p>}
        </div>
      </aside>

      {/* Pop Quiz Modal */}
      {showQuiz && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <button 
            onClick={handleQuizClick}
            className="text-8xl animate-bounce p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full"
          >
            🎉
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentView;
