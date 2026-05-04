import React, { useState, useEffect, useRef } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const radarInterval = useRef(null);

  // Radar Fetch: Poll every 5 seconds
  useEffect(() => {
    const fetchRadar = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/session/radar');
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
          setLastUpdate(new Date().toLocaleTimeString());
        } else {
          console.error('Radar fetch failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching radar:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchRadar();

    // Set up interval for every 5 seconds
    radarInterval.current = setInterval(fetchRadar, 5000);

    return () => {
      clearInterval(radarInterval.current);
    };
  }, []);

  const getScoreClass = (score) => {
    if (score > 80) return 'bg-green-100';
    if (score < 50) return 'bg-red-200';
    return 'bg-yellow-100';
  };

  const getStatusBadge = (isPresent) => {
    return isPresent 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white';
  };

  const getStatusText = (isPresent) => {
    return isPresent ? 'Present' : 'Away';
  };

  const formatLastUpdated = (isoDate) => {
    if (!isoDate) return 'N/A';
    return new Date(isoDate).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Teacher Radar</h1>
        <p className="text-gray-400">Real-time student focus monitoring</p>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 flex justify-between items-center bg-gray-800 p-4 rounded-lg">
        <div>
          <p className="text-sm text-gray-400">Active Students</p>
          <p className="text-2xl font-bold">{students.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Last Updated</p>
          <p className="text-lg font-mono">{lastUpdate || 'Loading...'}</p>
        </div>
        <div className="flex items-center gap-2">
          <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span className="text-sm text-gray-400">
            {loading ? 'Updating...' : 'Auto-refresh: 5s'}
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
        {students.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Session ID</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Score</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.sessionId}
                  className={`${getScoreClass(
                    student.score
                  )} border-b border-gray-700 transition-colors hover:opacity-75`}
                >
                  <td className="px-6 py-4 text-sm font-mono truncate text-gray-900">
                    {student.sessionId}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-white text-gray-900 px-3 py-1 rounded-full font-bold">
                      {student.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
                        student.isPresent
                      )}`}
                    >
                      {getStatusText(student.isPresent)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                    {formatLastUpdated(student.lastUpdated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>No active students. Waiting for heartbeats...</p>
          </div>
        )}
      </div>

      {/* Score Legend */}
      <div className="mt-8 flex gap-8 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-sm text-gray-400">Excellent (Score &gt; 80)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span className="text-sm text-gray-400">Average (50 - 80)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span className="text-sm text-gray-400">Low (Score &lt; 50)</span>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
