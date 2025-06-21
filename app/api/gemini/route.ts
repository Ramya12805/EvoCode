// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// export async function POST(req: NextRequest) {
//   const { prompt } = await req.json();
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   const result = await model.generateContent(prompt);
//   const text = result.response.text();

//   return NextResponse.json({ text });
// }





import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prompt = body.prompt || '';
  const code = body.code || '';
  const task = body.task || 'question'; // 'question' or 'evaluate'

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let finalPrompt = '';

    if (task === 'question') {
      finalPrompt = prompt;
    } else if (task === 'evaluate') {
      finalPrompt = `
You are a programming tutor. A student wrote this code in response to the following question.

Question: ${prompt}

Student's Code:
\`\`\`python
${code}
\`\`\`

Evaluate whether the code is correct or not. If it's wrong, explain the issue. If correct, explain why and provide a detailed analysis including time complexity, possible edge cases handled, and overall quality of the solution. Use markdown formatting in your reply.
`;
    }

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
