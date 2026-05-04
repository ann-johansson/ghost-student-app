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
    if (score > 80) return '#4ade80'; // green-400
    if (score < 50) return '#ef4444'; // red-500
    return '#facc15'; // yellow-400
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const FocusRing = ({ score }) => {
    return (
      <div>
        <p className="score-text" style={{ color: getScoreColor(score) }}>{score}</p>
      </div>
    );
  };


  return (
    <div className="student-view-container">
      {/* Main Content */}
      <main className="main-content">
        <header className="centered-header">
          <h1>GhostStudent</h1>
          <p>dont lose track</p>
        </header>
        
        <div className="video-feed">
          <div className="video-placeholder">
             <p>Video Feed Offline</p>
          </div>
        </div>
        <div className="controls">
            <button className="control-btn red"><FiMic size={20} /></button>
            <button className="control-btn"><FiVideo size={20} /></button>
            <button className="control-btn"><FiShare size={20} /></button>
            <button className="control-btn"><FiMessageSquare size={20} /></button>
            <button className="control-btn end-call"><FiXCircle size={24} /></button>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="right-sidebar">
        <h2>Dashboard</h2>
        <div className="focus-section">
          <h3>Focus Score</h3>
          <FocusRing score={focusScore} />
          {isDistracted && <p className="distracted-warning">You seem distracted!</p>}
        </div>
        <div className="stats-section">
            <div className="stat-row">
                <span>Status:</span>
                <span className={isDistracted ? 'status-distracted' : 'status-focused'}>
                    {isDistracted ? 'Distracted' : 'Focused'}
                </span>
            </div>
            <div className="stat-row">
                <span>Time Distracted:</span>
                <span>{formatTime(timeDistracted)}</span>
            </div>
        </div>
      </aside>

      {/* Pop Quiz Modal */}
      {showQuiz && (
        <div className="quiz-modal">
          <div className="quiz-content">
            <h2>Pop Quiz!</h2>
            <p>Click the button to prove you're paying attention!</p>
            <button onClick={handleQuizClick} className="quiz-btn">🎯</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;

