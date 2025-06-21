'use client';

import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

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
    setQuestion(data.text);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult('');
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
    setResult(data.text);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-indigo-700">EvoCode: Smart DSA Practice</h1>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Generate Question
          </button>
        </div>

        {question && (
          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-300 text-indigo-900 font-medium whitespace-pre-wrap">
            {question}
          </div>
        )}

        <textarea
          placeholder="Write your code here (Python)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-60 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-sm"
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
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
            <h2 className="font-semibold text-yellow-700 mb-2">Assessment Report:</h2>
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
