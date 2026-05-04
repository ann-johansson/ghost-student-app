import React, { useState, useEffect, useRef } from 'react';
import { FiVideo, FiMic, FiShare, FiMessageSquare, FiXCircle } from 'react-icons/fi';

const StudentView = () => {
  const [focusScore, setFocusScore] = useState(100);
  const [isDistracted, setIsDistracted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [timeDistracted, setTimeDistracted] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  const distractionInterval = useRef(null);
  const quizTimeout = useRef(null);
  const popQuizTimeout = useRef(null);
  const distractionTimer = useRef(null);
  const heartbeatInterval = useRef(null);

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

  // Initialize Session ID
  useEffect(() => {
    const generateSessionId = () => {
      let id = localStorage.getItem('ghostStudentSessionId');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ghostStudentSessionId', id);
      }
      setSessionId(id);
    };

    generateSessionId();
  }, []);

  // Heartbeat: Send score and presence status every 5 seconds
  useEffect(() => {
    if (!sessionId) return;

    const sendHeartbeat = async () => {
      try {
        const payload = {
          sessionId: sessionId,
          score: focusScore,
          isPresent: !document.hidden,
        };

        const response = await fetch('http://localhost:5000/api/session/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error('Heartbeat failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    };

    heartbeatInterval.current = setInterval(sendHeartbeat, 5000);

    return () => {
      clearInterval(heartbeatInterval.current);
    };
  }, [sessionId, focusScore]);

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
      <div style={{ textAlign: 'center' }}>
        <p className="score-text" style={{ color: getScoreColor(score), textAlign: 'center' }}>{score}</p>
      </div>
    );
  };


  return (
    <div className="student-view-container">
      {/* Main Content */}
      <main className="main-content">
        <header className="centered-header">
          <h1 style={{ color: 'white', textAlign: 'center' }}>GhostStudent</h1>
          <p style={{ color: 'white', textAlign: 'center' }}>dont lose track</p>
        </header>
        
        <div className="video-feed">
          <div className="video-placeholder">
             <p style={{ color: 'white', textAlign: 'center' }}>Video Feed Offline</p>
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
        <h2 style={{ color: 'white', textAlign: 'center' }}>Dashboard</h2>
        <div className="focus-section">
          <h3 style={{ color: 'white', textAlign: 'center' }}>Focus Score</h3>
          <FocusRing score={focusScore} />
          {isDistracted && <p className="distracted-warning" style={{ color: 'white', textAlign: 'center' }}>You seem distracted!</p>}
        </div>
        <div className="stats-section">
            <div className="stat-row">
                <span style={{ color: 'white' }}>Status:</span>
                <span className={isDistracted ? 'status-distracted' : 'status-focused'} style={{ color: 'white' }}>
                    {isDistracted ? 'Distracted' : 'Focused'}
                </span>
            </div>
            <div className="stat-row">
                <span style={{ color: 'white' }}>Time Distracted:</span>
                <span style={{ color: 'white' }}>{formatTime(timeDistracted)}</span>
            </div>
        </div>
      </aside>

      {/* Pop Quiz Modal */}
      {showQuiz && (
        <div className="quiz-modal">
          <div className="quiz-content">
            <h2 style={{ color: 'white', textAlign: 'center' }}>Pop Quiz!</h2>
            <p style={{ color: 'white', textAlign: 'center' }}>Click the button to prove you're paying attention!</p>
            <button onClick={handleQuizClick} className="quiz-btn">🎯</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;

