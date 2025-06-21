'use client';

import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    setResult('');
    const res = await fetch('/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Give me a random easy-level coding question in Python with examples.' }),
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
    <main className="min-h-screen p-10 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-6">🧬 EvoCode: Personalized Coding Practice</h1>

      <button
        onClick={fetchQuestion}
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Generating Question...' : '🎲 Generate Coding Question'}
      </button>

      <div className="my-6 p-4 bg-white rounded shadow whitespace-pre-wrap min-h-[120px]">
        {question || 'Click the button above to generate a question.'}
      </div>

      <textarea
        className="w-full h-64 p-4 border rounded mb-4 font-mono"
        placeholder="Write your Python code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <div className="space-x-4">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          🚀 Submit
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-500 rounded text-lg whitespace-pre-wrap">
          {result}
        </div>
      )}
    </main>
  );
}
