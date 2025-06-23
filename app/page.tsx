'use client';

import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
    const res = await fetch('/api/gemini', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Give a random coding question on DSA topic',
        task: 'question',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    setQuestion(stripMarkdown(data.text));
    setLoading(false);
  };

  // const handleSubmit = async () => {
  //   setLoading(true);
  //   setResult('');
  //   const res = await fetch('/api/gemini', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       task: 'evaluate',
  //       prompt: question,
  //       code: code,
  //     }),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });

  //   const data = await res.json();
  //   setResult(stripMarkdown(data.text));
  //   setLoading(false);
  // };

  const handleSubmit = async () => {
  setLoading(true);
  setResult('');

  try {
    // 1️⃣ Call Gemini via your existing API
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
    const report = stripMarkdown(data.text);
    setResult(report);

    // 2️⃣ Send to backend (MongoDB)
    await fetch('http://localhost:5000/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        code: code,
        report: report,
      }),
    });
  } catch (error) {
    console.error('Submission failed:', error);
    setResult('Something went wrong while submitting. Please try again.');
  }

  setLoading(false);
};

  return (
    <main className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-100 to-white text-gray-900'} min-h-screen flex items-center justify-center px-4 py-12`}>
      <div className={`w-full max-w-4xl shadow-2xl rounded-2xl p-8 space-y-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">EvoCode</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm text-indigo-500 border border-indigo-500 px-3 py-1 rounded-md hover:bg-indigo-500 hover:text-white transition"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Generate Question
          </button>
        </div>

        {question && (
          <div className={`p-4 rounded-md border ${darkMode ? 'bg-gray-700 border-indigo-400 text-white' : 'bg-indigo-50 border-indigo-300 text-indigo-900'} whitespace-pre-wrap`}>
            {question}
          </div>
        )}

        <textarea
          placeholder="Write your code here (Python)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`w-full h-60 p-4 border rounded-lg font-mono text-sm resize-none leading-relaxed ${
            darkMode
              ? 'bg-gray-900 text-white border-gray-600 focus:ring-indigo-400'
              : 'bg-white text-black border-gray-300 focus:ring-indigo-400'
          } focus:outline-none focus:ring-2`}
        />

        <div className="flex justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} transition`}
          >
            {loading ? 'Checking...' : 'Submit'}
          </button>
        </div>

        {result && (
          <div className={`mt-4 p-4 rounded-md border-l-4 text-sm whitespace-pre-wrap leading-relaxed ${
            darkMode ? 'bg-gray-700 border-yellow-500 text-yellow-100' : 'bg-yellow-50 border-yellow-500 text-gray-800'
          }`}>
            <h2 className="font-semibold mb-2">Assessment Report:</h2>
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
