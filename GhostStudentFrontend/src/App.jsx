import { useState } from 'react';
import StudentView from './StudentView';
import TeacherDashboard from './TeacherDashboard';
import './index.css';

function App() {
  const [view, setView] = useState('home');

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">GhostStudent</h1>
          <p className="text-white text-lg mb-12 text-center">Choose your role</p>
          
          <div className="flex gap-6 justify-center flex-col sm:flex-row">
            <button
              onClick={() => setView('student')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-colors shadow-lg"
            >
              👨‍🎓 Student
            </button>
            <button
              onClick={() => setView('teacher')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-lg transition-colors shadow-lg"
            >
              👨‍🏫 Teacher
            </button>
          </div>

          <p className="text-white text-sm mt-8 text-center">dont lose track</p>
        </div>
      </div>
    );
  }

  if (view === 'student') {
    return <StudentView />;
  }

  if (view === 'teacher') {
    return <TeacherDashboard />;
  }
}

export default App;
