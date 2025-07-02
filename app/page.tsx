'use client';

import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [showPanel, setShowPanel] = useState(false);

  // Utility to strip markdown like #, **, etc.
  const stripMarkdown = (text: string) => {
    return text
      .replace(/[#*_`>-]/g, '') // remove markdown chars
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove markdown links
      .replace(/\n{3,}/g, '\n\n') // limit empty lines
      .trim();
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    setShowPanel(false);
    const res = await fetch('/api/gemini', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Generate a random DSA coding questionzz',
        task: 'question',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    setQuestion(stripMarkdown(data.text));
    setLoading(false);
    // setShowPanel(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        body: JSON.stringify({
          task: 'evaluate',
          prompt: question,
          code: code,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      const rawReport = stripMarkdown(data.text);

      const extractReport = (text: string) => {
        const correctnessMatch = text.match(/correct(?:ness)?:\s*(.*)/i);
        const timeComplexityMatch = text.match(/time complexity:\s*(.*)/i);
        const spaceComplexityMatch = text.match(/space complexity:\s*(.*)/i);

        const correctness = correctnessMatch?.[1]?.trim().toLowerCase() || 'unknown';

        return {
          is_correct: correctness.includes('yes') || correctness.includes('correct') ? 'yes' : 'no',
          correctness,
          time_complexity: timeComplexityMatch?.[1]?.trim() || 'Unknown',
          space_complexity: spaceComplexityMatch?.[1]?.trim() || 'Unknown',
        };
      };

      const structuredReport = extractReport(rawReport);

      setResult(rawReport);

      await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          code: code,
          report: structuredReport,
          difficulty,
        }),
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setResult('Something went wrong while submitting. Please try again.');
    }

    setLoading(false);
  };

  return (
  <main className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen p-8`}>
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-indigo-600">EvoCode</h1>
      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Generate Question
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-sm px-3 py-1 border rounded-md"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </div>

    {/* Question Preview */}
    {question && !showPanel && (
      <div className="border p-4 rounded flex justify-between items-center shadow-md bg-indigo-50">
        <p className="truncate max-w-md font-medium text-indigo-700">{question.slice(0, 80)}...</p>
        <button
          onClick={() => setShowPanel(true)}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          View
        </button>
      </div>
    )}

    {/* Full View */}
    {showPanel && (
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Left: Question Full */}
        <div className={`p-4 rounded-xl border shadow-md ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
          <h2 className="text-lg font-semibold text-indigo-600 mb-2">Question</h2>
          <pre className="whitespace-pre-wrap text-sm">{question}</pre>
        </div>

        {/* Right: Code + Tools */}
        <div className={`p-4 rounded-xl border shadow-md flex flex-col gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* <h2 className="text-lg font-semibold text-indigo-600">Your Code</h2> */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-indigo-600">Your Code</h2>
            <button
              onClick={() => setShowPanel(false)}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ← Back
            </button>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your Python code here..."
            rows={10}
            className={`w-full font-mono text-sm p-3 rounded border resize-none ${
              darkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-gray-50 text-black border-gray-300'
            }`}
          />

          {/* Difficulty */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium">How did you feel about the difficulty?</label>
            <div className="flex gap-3">
              {[
                { key: 'below_expected', label: 'Below Expected', color: 'bg-green-100 text-green-800 border-green-400' },
                { key: 'as_expected', label: 'As Expected', color: 'bg-blue-100 text-blue-800 border-blue-400' },
                { key: 'above_expected', label: 'Above Expected', color: 'bg-red-100 text-red-800 border-red-400' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`px-4 py-1 border rounded-full text-sm transition ${
                    color
                  } ${difficulty === key ? 'ring-2 ring-offset-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>


          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => alert("Run feature not implemented yet")}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 text-white rounded ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Checking...' : 'Submit'}
            </button>
          </div>

          {/* Report */}
          {result && (
            <div className={`p-4 border-l-4 text-sm rounded mt-4 whitespace-pre-wrap ${
              darkMode ? 'bg-gray-700 border-yellow-500 text-yellow-100' : 'bg-yellow-50 border-yellow-500 text-gray-800'
            }`}>
              <strong>Assessment Report:</strong>
              <p className="mt-2">{result}</p>
            </div>
          )}
        </div>
      </div>
    )}
  </main>
);

}
